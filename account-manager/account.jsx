import db from '../store/database.jsx'
import request from 'request'
import Skype from '../skype/index.jsx'
import SkypeAccount from '../rat/src/skype_account.ts'
import Skyweb from '../rat/src/skyweb.ts'
import striptags from 'striptags'
import UserAgent from '../util/user-agent.jsx'
import {AllHtmlEntities} from 'html-entities'
import {exclude, Type, Status} from '../app/config'
import {isSkypeUsername, getMri} from '../util/index.jsx'
import {pick, extend, isObject, isEmpty, identity} from 'lodash'

export default class Account {
  constructor(options) {
    this.info = options
    this._lastId = Date.now()
  }

  async login() {
    if (!this.internal) {
      this.internal = new Skyweb()
      try {
        await this.internal.login(this.info.login, this.info.password)
      }
      catch (ex) {
        console.error(ex)
        const skype = await Skype.load(this.info)
        this.info.headers = skype.headers
        this.agent = this.info.headers['User-Agent']
        this.info.headers.Cookie.split(/;\s+/g).forEach(s => this.internal.cookieJar.setCookie(s))
        this.internal.skypeAccount = new SkypeAccount(this.info.login, this.info.password)
        extend(this.internal.skypeAccount, {
          skypeToken: skype.headers['X-Skypetoken'],
          selfInfo: {
            username: this.info.login
          },
          registrationTokenParams: {
            raw: skype.headers.RegistrationToken
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
        console.log(err, res)
        if (err) {
          reject(err)
        }
        else {
          resolve(res)
        }
      })
    })
  }

  loadContacts() {
    return new Promise((resolve, reject) =>
      this.internal.contactsService.loadContacts(this.internal.skypeAccount, resolve, reject))
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
          name: c.display_name,
          authorized: c.authorized ? 1 : 0,
          favorite: c.favorite ? 1 : 0,
          status: found ? found.status : Status.CREATED,
          created: new Date(c.creation_time).getTime(),
          time: found ? found.time : this.nextId()
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
    const contacts = (await db.contact.filter(c => account === c.account).toArray())
      .map(({id, login}) => ({login, mri: '8:' + login}))
    //  || 'Favorites' !== g.name
    const groups = this.internal.contactsService.groups
    // .filter(g => !g.is_favorite)
      .map(g => ({
        account,
        id: g.id,
        name: g.name,
        contacts: g.contacts.map(mri => contacts.find(c => mri === c.mri)).filter(identity).map(c => c.login),
      }))
    const absent = groups
      .filter(c => !existing.find(x => c.id == x.id))
      .map(c => c.id)
    await db.group.bulkDelete(absent)
    await db.group.bulkPut(groups)
  }

  async send(message) {
    await this.login()
    return this.internal.sendMessage(getMri(message), message.text)
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
    const {conversations} = JSON.parse((await this.request('GET', url)).body)
    if (conversations instanceof Array) {
      this.info.conversations = conversations.filter(c => 0 === c.id.indexOf('19:'))
    }
  }

  async saveChats() {
    const existing = (await db.contact
      .filter(c => this.info.login === c.account && Type.CHAT === c.type)
      .toArray()).map(c => c.id)
    const contacts = []
    const absent = []

    const account = this.info.login
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
    console.log(absent, contacts)
  }
}
