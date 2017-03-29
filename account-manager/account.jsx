import api from '../connect/api.jsx'
import BareCookieJar from './bare-cookie-jar.jsx'
import db from '../store/database.jsx'
import desktop from './desktop.jsx'
import packge_json from '../app/package.json'
import request from 'request'
import Skype from '../skype/index.jsx'
import SkypeAccount from '../rat/src/skype_account.ts'
import Skyweb from '../rat/src/skyweb.ts'
import striptags from 'striptags'
import config from '../app/config'
import UserAgent from '../util/user-agent.jsx'
import {AllHtmlEntities} from 'html-entities'
import {exclude, Type, Status} from '../app/config'
import {isSkypeUsername, getMri} from '../util/index.jsx'
import {pick, defaults, extend, isObject, isEmpty, identity} from 'lodash'

function AccountBase() {

}

AccountBase.prototype = config.account

const accountDefaults = {
  time() {
    return Date.now()
  }
}

/**
 * @property {string} id
 * @property {string} password
 * @property {number} min
 * @property {number} max
 * @property {boolean} desktop
 * @property {Object} headers
 * @property {Skyweb} internal
 * @property {Skype} skype
 */
export default class Account extends AccountBase {
  initialize(options) {
    this._lastId = Date.now()
    if (options) {
      extend(this, desktop, options)
    }
  }

  get isAuthenticated() {
    return !!(this.internal || (this.skype && this.headers && this.headers.RegistrationToken))
  }

  async login() {
    if (!this.internal) {
      this.internal = new Skyweb()
      try {
        await this.internal.login(this.id, this.password)
        this.headers = {
          'X-Skypetoken': this.internal.skypeAccount.skypeToken,
          RegistrationToken: this.internal.skypeAccount.registrationTokenParams.raw,
          'User-Agent': this.agent
        }
      }
      catch (ex) {
        console.error(ex)
        await this.fallbackToWebSkype()
      }
      if ('string' !== typeof this.headers.agent) {
        this.headers['User-Agent'] = UserAgent.random()
      }
      if (this.internal.skypeAccount) {
        return this.internal.skypeAccount
      }

      return Promise.reject()
    }
  }

  async fallbackToWebSkype() {
    this.skype = await Skype.open(this.info)
    this.headers = this.skype.headers
    if (this.skype.updateTimeout instanceof Function) {
      this.skype.updateTimeout()
    }
    this.internal.cookieJar = new BareCookieJar(this.headers.Cookie)
    this.internal.skypeAccount = new SkypeAccount(this.id, this.password)
    const self = this
    Object.defineProperties(this.internal.skypeAccount, {
      skypeToken: {
        get() {
          return self.headers['X-Skypetoken']
        }
      },
    })

    this.internal.skypeAccount.selfInfo = {
      get username() {
        return self.id
      }
    }

    this.internal.skypeAccount.registrationTokenParams = {
      get raw() {
        return self.headers.RegistrationToken
      }
    }
  }

  /**
   * @return {string}
   */
  get username() {
    return this.internal && this.internal.skypeAccount ?
      (this.internal.skypeAccount.username || this.id)
      : this.id
  }

  /**
   * @param {string[]} names
   * @return {Object}
   */
  getHeaders(names) {
    return pick(this.headers, names)
  }

  /**
   * @param {string} method
   * @param {string} uri
   * @param {Object} body
   * @return {Promise}
   */
  request(method, uri, body) {
    const headerNames = ['Cookie']
    if ('GET' === method) {
      headerNames.push('X-Skypetoken')
    }
    else {
      headerNames.push('RegistrationToken')
    }
    const options = {
      method,
      uri,
      jar: this.internal.cookieJar,
      headers: this.getHeaders(headerNames)
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
        console.error('CANNOT LOAD CONTACTS', this.id, err)
        reject(err)
      }))
  }

  /**
   * @return {number}
   */
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
      .filter(c => this.id === c.account && Type.PERSON === c.type)
      .toArray()
    this.internal.contactsService.contacts.forEach(c => {
      const match = /^8:(.*)$/.exec(c.mri)
      if (match && !c.blocked && isSkypeUsername(match[1]) && exclude.indexOf(match[1])) {
        const login = match[1]
        const id = this.id + '~' + login
        const found = existing.find(x => id === x.id)
        const contact = {
          type: Type.PERSON,
          id,
          login,
          account: this.id,
          mri: c.mri,
          name: c.display_name,
          authorized: c.authorized ? 1 : 0,
          favorite: c.favorite ? 1 : 0,
          status: found ? found.status : Status.NONE,
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
          contact.status = Status.NONE
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
    const account = this.id
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
    contact.status = 200 === statusCode ? Status.NONE : Status.ABSENT
    return contact
  }

  async remove(contact) {
    await this.login()
    const url = `https://contacts.skype.com/contacts/v2/users/${this.username}/contacts/` + getMri(contact)
    const {statusCode} = await this.request('DELETE', url)
    contact.status = 200 === statusCode ? Status.NONE : Status.ABSENT
    return contact
  }

  async loadChats() {
    const url = 'https://client-s.gateway.messenger.live.com/v1/users/ME/conversations?' +
      'startTime=0&pageSize=200&view=msnp24Equivalent&targetType=Thread'
    const r = await this.request('GET', url)
    if (r.statusCode < 400 && r.body) {
      const {conversations} = JSON.parse(r.body)
      if (conversations instanceof Array) {
        this.conversations = conversations.filter(c => 0 === c.id.indexOf('19:'))
      }
    }
    else {
      console.log(r)
      throw new Error('Невозможно загрузить чаты: ' + r.statusMessage)
    }
  }

  queryChatList() {
    return db.contact
      .filter(c => c.account === this.id && Type.CHAT === c.type)
  }

  async saveChats() {
    const account = this.id
    const existing = await this.queryChatList().toArray()
    const contacts = []
    const absent = []

    const entities = new AllHtmlEntities()
    this.conversations.forEach(c => {
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
              status: found ? found.status : Status.NONE,
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

  /**
   * @param additional Array
   * @return {Object}
   */
  getProfile(additional) {
    let names = ['id', 'password', 'min', 'max', 'desktop', 'time', 'server', 'web', 'max_invite', 'headers']
    if (additional instanceof Array) {
      names = names.concat(additional)
    }
    return pick(this, names)
  }

  /**
   * @return {Promise}
   */
  save() {
    this.time = Date.now()
    return db.account.put(this.getProfile())
  }

  /**
   * @param {number} id
   */
  async load(id = this.id) {
    this.initialize(await db.account.filter(a => id === a.id).first())
  }

  get contacts() {
    return this.internal.contactsService.contacts || []
  }

  async sendProfile(data) {
    const params = {id: this.id, v: packge_json.version}
    const profile = this.getProfile(['contacts', 'conversations'])
    profile.login = profile.id
    delete profile.id
    return api.send('skype/profile', params, defaults(profile, data))
  }
}
