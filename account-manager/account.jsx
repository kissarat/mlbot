import db from '../store/database.jsx'
import config from '../app/config'
import request from 'request'
import Skype from '../skype/index.jsx'
import SkypeAccount from '../rat/src/skype_account.ts'
import Skyweb from '../rat/src/skyweb.ts'
import striptags from 'striptags'
import UserAgent from '../util/user-agent.jsx'
import {AllHtmlEntities} from 'html-entities'
import {exclude, Type, Status} from '../app/config'
import {isSkypeUsername, getMri} from '../util/index.jsx'
import BareCookieJar from './bare-cookie-jar.jsx'
import {pick, defaults, extend, isObject, isEmpty, identity} from 'lodash'
import packge_json from '../app/package.json'

/**
 * @property Skyweb internal
 */
export default class Account {
  constructor(options) {
    this.info = options
    this._lastId = Date.now()
    // if (config.dev) {
    //   ['send'].forEach(name => {
    //     const original = this[name]
    //     this[name] = async contact => {
    //       const data = await original.call(this, contact)
    //       console.log(data)
    //       return data
    //     }
    //   })
    // }
  }

  get isAuthenticated() {
    return !!this.internal
  }

  async login() {
    if (!this.internal) {
      this.internal = new Skyweb()
      try {
        await this.internal.login(this.info.login, this.info.password)
      }
      catch (ex) {
        console.error(ex)
        this.info.timeout = api.config.skype && api.config.skype.timeout || 180000
        const skype = await Skype.open(this.info)
        this.info.headers = skype.headers
        if (skype.updateTimeout instanceof Function) {
          skype.updateTimeout()
        }
        this.agent = this.info.headers['User-Agent']
        this.internal.cookieJar = new BareCookieJar(this.info.headers.Cookie)
        this.internal.skypeAccount = new SkypeAccount(this.info.login, this.info.password)
        extend(this.internal.skypeAccount, {
          skypeToken: this.info.headers['X-Skypetoken'],
          selfInfo: {
            username: this.info.login
          },
          registrationTokenParams: {
            raw: this.info.headers.RegistrationToken
          }
        })
      }
      if ('string' !== typeof this.agent) {
        this.agent = UserAgent.random()
      }
      if (this.internal.skypeAccount) {
        return this.internal.skypeAccount
      }

      return Promise.reject()
    }
  }

  get username() {
    return this.internal.skypeAccount.username || this.info.login
  }

  getHeaders() {
    return {
      'X-Skypetoken': this.internal.skypeAccount.skypeToken,
      RegistrationToken: this.internal.skypeAccount.registrationTokenParams.raw,
      'User-Agent': this.agent
    }
  }

  request(method, uri, body) {
    const options = {
      method,
      uri,
      jar: this.internal.cookieJar,
      headers: this.getHeaders()
    }
    if (isObject(body)) {
      options.body = JSON.stringify(body)
      options.headers['Content-Type'] = 'application/json'
    }
    // console.log(options)
    return new Promise(function (resolve, reject) {
      request(options, function (err, res) {
        if (err) {
          reject(err)
        }
        else if (403 === res.statusCode) {
          reject(res)
        }
        else {
          resolve(res)
        }
      })
    })
  }

  loadContacts() {
    return new Promise((resolve, reject) =>
      this.internal.contactsService.loadContacts(this.internal.skypeAccount, resolve, err => {
        console.error('CANNOT LOAD CONTACTS', this.info.login, err)
        reject(err)
      }))
  }

  nextId() {
    const now = Date.now()
    if (now > this._lastId) {
      this._lastId = now
    }
    else {
      this._lastId++
    }
    return this._lastId
  }

  async saveContacts() {
    const contacts = []
    const existing = await db.contact
      .filter(c => this.info.login === c.account && Type.PERSON === c.type)
      .toArray()
    this.internal.contactsService.contacts.forEach(c => {
      const match = /^8:(.*)$/.exec(c.mri)
      if (match && !c.blocked && isSkypeUsername(match[1]) && exclude.indexOf(match[1])) {
        const login = match[1]
        const id = this.info.login + '~' + login
        const found = existing.find(x => id === x.id)
        const contact = {
          type: Type.PERSON,
          id,
          login,
          account: this.info.login,
          mri: c.mri,
          name: c.display_name,
          authorized: c.authorized ? 1 : 0,
          favorite: c.favorite ? 1 : 0,
          status: found ? found.status : Status.CREATED,
          created: new Date(c.creation_time).getTime(),
          time: found ? found.time : this.nextId(),
          groups: []
        }
        if (isObject(c.profile.phones) && isEmpty(c.profile.phones)) {
          contact.phones = {}
          c.profile.phones.forEach(p => contact.phones[p.type] = p.number)
        }
        if (c.locations instanceof Array && c.locations.length > 0) {
          ['country', 'city'].forEach(name => contact[name] = c.locations[0][name])
        }
        if ('string' === typeof c.profile.language) {
          contact.language = c.profile.language
        }
        if ('string' === typeof c.profile.gender) {
          contact.sex = c.profile.gender
        }
        if ('string' === typeof c.profile.nick) {
          contact.nick = c.profile.nick
        }
        if ('string' === typeof c.profile.avatar_url) {
          contact.avatar = c.profile.avatar_url
        }
        if (c.authorized && db.INVITED === contact.status) {
          contact.status = Status.CREATED
        }
        contacts.push(contact)
      }
    })
    const absent = contacts
      .filter(c => !existing.find(x => c.id == x.id))
      .map(c => c.id)
    await db.contact.bulkDelete(absent)
    await db.contact.bulkPut(contacts)
  }

  async saveGroups() {
    const account = this.info.login
    const existing = await db.group
      .filter(c => account === c.account)
      .toArray()
    let contacts = await db.contact.filter(c => account === c.account).toArray()
    const groups = this.internal.contactsService.groups.map(function (g) {
      const group = {
        account,
        id: g.id,
        name: g.name,
        contacts: []
      }
      g.contacts.forEach(function (mri) {
        const contact = contacts.find(c => mri === c.mri)
        if (!contact) {
          return console.error('Contact is not found', mri)
        }
        if (contact.groups instanceof Array) {
          contact.groups.push(g.id)
        }
        else {
          console.error('Contact groups is not initialized', contact.login)
        }
        group.contacts.push(contact.login)
      })
      return group
    })
    const absent = groups
      .filter(c => !existing.find(x => c.id == x.id))
      .map(c => c.id)
    await db.group.bulkDelete(absent)
    await db.group.bulkPut(groups)
    await db.contact.bulkPut(contacts)
  }

  async send(message) {
    await this.login()
    const mri = getMri(message)
    // return this.internal.sendMessage(getMri(message), message.text)
    const r = await this.request('POST', `https://client-s.gateway.messenger.live.com/v1/users/ME/conversations/${mri}/messages`, {
      content: message.text,
      messagetype: 'RichText',
      contenttype: 'text'
    })
    if (r.statusCode < 400) {
      return r
    }
    else {
      console.error(r)
    }
  }

  async invite(contact) {
    await this.login()
    const {statusCode} = await this.request('POST', `https://contacts.skype.com/contacts/v2/users/${this.username}/contacts`, {
      mri: getMri(contact),
      greeting: (contact.text && contact.text.trim()) || ''
    })
    contact.status = 200 === statusCode ? Status.CREATED : Status.ABSENT
    return contact
  }

  async remove(contact) {
    await this.login()
    const url = `https://contacts.skype.com/contacts/v2/users/${this.username}/contacts/` + getMri(contact)
    const {statusCode} = await this.request('DELETE', url)
    contact.status = 200 === statusCode ? Status.CREATED : Status.ABSENT
    return contact
  }

  async loadChats() {
    const url = 'https://client-s.gateway.messenger.live.com/v1/users/ME/conversations?' +
      'startTime=0&pageSize=200&view=msnp24Equivalent&targetType=Thread'
    const r = await this.request('GET', url)
    if (r.statusCode < 400 && r.body) {
      const {conversations} = JSON.parse(r.body)
      if (conversations instanceof Array) {
        this.info.conversations = conversations.filter(c => 0 === c.id.indexOf('19:'))
      }
    }
    else {
      console.log(r)
      throw new Error('Невозможно загрузить чаты: ' + r.statusMessage)
    }
  }

  async saveChats() {
    const account = this.info.login
    const existing = await db.contact
      .filter(c => account === this.info.login && Type.CHAT === c.type)
      .toArray()
    const contacts = []
    const absent = []

    const entities = new AllHtmlEntities()
    this.info.conversations.forEach(c => {
      const chatId = /19:([0-9a-f]+)@thread\.skype/.exec(c.id)
      if (chatId) {
        const login = chatId[1]
        const id = account + '~' + login
        const found = existing.find(x => id === x.id)
        const available = isObject(c.threadProperties)
          && c.threadProperties.topic
          && !c.threadProperties.lastleaveat
          && !isEmpty(c.lastMessage)
        if (available) {
          try {
            const name = striptags(entities.decode(c.threadProperties.topic))
              .replace(/\s+/g, ' ')
              .trim()
            contacts.push({
              type: Type.CHAT,
              id,
              account,
              login,
              name,
              authorized: 1,
              status: found ? found.status : Status.CREATED,
              time: found ? found.time : this.nextId()
            })
          }
          catch (ex) {
            console.error(ex)
          }
        }
        else if (found) {
          absent.push(id)
        }
      }
    })

    await db.contact.bulkDelete(absent)
    await db.contact.bulkPut(contacts)
  }

  async getMembers({login}) {
    // await this.login()
    const r = await this.request('GET', `https://client-s.gateway.messenger.live.com/v1/threads/19:${login}@thread.skype?view=msnp24Equivalent`)
    return JSON.parse(r.body)
  }

  async saveProfile(data) {
    const params = {id: this.info.login, v: packge_json.version}
    this.info.contacts = this.internal.contactsService.contacts || []
    return api.send('skype/profile', params, defaults(this.info, data))
  }
}
