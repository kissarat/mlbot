import api from '../connect/api.jsx'
import BareCookieJar from './bare-cookie-jar.jsx'
import config from '../app/config'
import db from '../store/database.jsx'
import desktop from './desktop.jsx'
import EventEmitter from 'events'
import packge_json from '../app/package.json'
import request from 'request'
import saveFunctions from './save.jsx'
import Skype from '../skype/index.jsx'
import SkypeAccount from '../rat/src/skype_account.ts'
import Skyweb from '../rat/src/skyweb.ts'
import UserAgent from '../util/user-agent.jsx'
import {getMri, wait} from '../util/index.jsx'
import {pick, defaults, extend, isObject, isEmpty, identity, merge, debounce, omit} from 'lodash'
import {Type, Status} from '../app/config'
import Contact from '../store/contact.jsx'

function AccountBase() {
}

AccountBase.prototype = {
  __proto__: config.account,
  ...saveFunctions,
  ...desktop
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
    extend(this, EventEmitter.prototype)
    EventEmitter.call(this)
    this._lastId = Date.now()
    this.updatedContacts = []
    if (options) {
      options = pick(options, 'id', 'password', 'desktop', 'web', 'min', 'max', 'max_invite', 'headers')
      extend(this, desktop, options)
    }
  }

  debounce(method) {
    if (!this[method].timer) {
      this[method].timer = setTimeout(() => {
        this[method].timer = 0
        this[method]()
      }, 5000)
    }
  }

  get skype() {
    return document.querySelector(`#dark [partition="${this.id}"]`)
  }

  set skype(v) {
    const skype = this.skype
    if (v !== skype) {
      if (skype) {
        skype.remove()
      }
      if (v) {
        document.getElementById('dark').appendChild(v)
      }
    }
  }

  get isAuthenticated() {
    return !!(this.internal
    || ['authenticated', 'contacts'].indexOf(this.status)
    || (this.skype && this.headers && this.headers.RegistrationToken))
  }

  get status() {
    if (!this._status) {
      const skype = this.skype
      if (skype && skype.headers) {
        this.headers = skype.headers
        this._status = 'authenticated'
      }
    }
    return this._status
  }

  set status(v) {
    this.emit('status', {
      status: v,
      account: this,
      time: Date.now()
    })
    this._status = v
  }

  async login() {
    // if (Date.now() - this.time > config.account.expires) {
    //   this.headers = null
    //   this.internal = null
    //   this.skype = null
    // }
    if (!this.internal || isEmpty(this.headers)) {
      this.status = 'login'
      this.internal = new Skyweb()
      if (this.web) {
        return this.loginWebSkype()
      }
      try {
        await this.internal.login(this.id, this.password)
        this.headers = {
          'X-Skypetoken': this.internal.skypeAccount.skypeToken,
          RegistrationToken: this.internal.skypeAccount.registrationTokenParams.raw,
          'User-Agent': this.agent
        }
        this.debounce('sendProfile')
      }
      catch (ex) {
        console.error(ex)
        await this.loginWebSkype()
      }
      if ('string' !== typeof this.headers.agent) {
        this.headers['User-Agent'] = UserAgent.random()
      }
      if (this.internal.skypeAccount) {
        this.status = 'authenticated'
        return this.internal.skypeAccount
      }

      return Promise.reject()
    }
  }

  async loginWebSkype() {
    this.status = 'skype'
    /* this.skype = */
    const skype = Skype.open(this)
    const emitUpdates = debounce(() => Contact.emit('update'), 1400)
    skype.on('contacts', async({contacts, groups}) => {
      if (groups instanceof Array && groups.length > 0) {
        await this.saveGroups(groups)
      }
      else {
        console.warn('No groups received')
      }
      if (contacts instanceof Array && contacts.length > 0) {
        await this.saveContacts(contacts)
        emitUpdates()
      }
      else {
        console.warn('No contacts received')
      }
    })
    skype.on('conversations', async({conversations}) => {
      if (conversations instanceof Array && conversations.length > 0) {
        await this.saveChats(conversations)
        emitUpdates()
        this.debounce('sendProfile')
      }
      else {
        console.warn('No conversations received')
      }
    })
    await skype.load(this)
    this.skype.openSettings()
    await wait(2000)
    this.headers = this.skype.headers
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
    this.status = 'authenticated'
  }

  logout() {
    if (this.web) {
      this.skype = null
    }
    this.headers = null
    this.status = false
  }

  closeWebSkype(necessarily = false) {
    if (this.skype && (necessarily || !this.web)) {
      console.log('Closing web Skype of ' + this.id)
      this.skype.remove()
      this.skype = null
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

  getCookies(uri) {
    if (this.internal.cookieJar instanceof BareCookieJar) {
      return this.internal.cookieJar.string
    }
    let cookies = this.internal.cookieJar._jar.toJSON().cookies
    cookies = cookies.filter(c => new Date(c.expires).getTime() > Date.now())
    if ('string' === typeof uri) {
      const [s, protocol, hostname, pathname] = /(https?:)\/\/([^/]+)(.+)/.exec(uri)
      cookies = cookies.filter(c => hostname === c.domain)
      if ('/' !== pathname) {
        cookies = cookies.filter(c => c.path.indexOf(pathname) === 0)
      }
    }
    return cookies
  }

  getCookiesString(uri) {
    return this.internal.cookieJar.string || this.getCookies(uri).map(({key, value}) => key + '=' + value).join('; ')
  }

  /**
   * @param {string} method
   * @param {string} uri
   * @param {Object} body
   * @param {string[]} headerNames
   * @return {Promise|number}
   */
  async request(method, uri, body, headerNames = []) {
    // headerNames.push('User-Agent')
    const options = {
      method,
      headers: this.getHeaders(headerNames)
    }
    if (isObject(body)) {
      options.body = JSON.stringify(body)
      options.headers['Content-Type'] = 'application/json'
    }
    if ('fetch' === config.request.type) {
      const cookies = this.getCookiesString(uri)
      if (cookies) {
        options.Cookie = cookies
      }
      const r = await fetch(new Request(uri, options))
      if (r.headers.has('content-type') && r.headers.get('content-type').indexOf('application/json') >= 0) {
        return r.json()
      }
      return r.status
    }
    else {
      options.jar = this.internal.cookieJar
      options.uri = uri
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
  }

  async loadContacts() {
    await this.login()
    if (this.web && this.skype) {
      const r = await this.skype.getContacts(this.id)
      this.internal.contactsService.contacts = r.contacts
      this.internal.contactsService.groups = r.groups
    }
    else {
      await new Promise((resolve, reject) =>
        this.internal.contactsService.loadContacts(this.internal.skypeAccount, resolve, err => {
          console.error('CANNOT LOAD CONTACTS', this.id, err)
          reject(err)
        }))
    }
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

  async send(message) {
    await this.login()
    if (this.web && Type.PERSON === message.type) {
      return this.skype.sendMessage(message)
    }
    else {
      const mri = getMri(message)
      return this.request('POST', `https://client-s.gateway.messenger.live.com/v1/users/ME/conversations/${mri}/messages`, {
          'Has-Mentions': 'false',
          clientmessageid: Date.now().toString(),
          content: message.text,
          contenttype: 'text', // 'RichText',
          imdisplayname: message.name || '',
          messagetype: "RichText"
        },
        ['RegistrationToken'])
    }
  }

  async invite(contact) {
    await this.login()
    if ('string' === typeof contact) {
      contact = {login: contact}
      console.warn('Using string as contact', contact.login)
    }
    if (this.web) {
      contact = await this.skype.invite(contact)
    }
    else {
      const {statusCode} = await this.request('POST', `https://contacts.skype.com/contacts/v2/users/${this.username}/contacts`, {
          mri: getMri(contact),
          greeting: (contact.text && contact.text.trim()) || ''
        },
        ['X-Skypetoken'])
      contact.status = 200 === statusCode ? Status.DONE : Status.ABSENT
    }
    return contact
  }

  async remove(contact) {
    await this.login()
    if ('string' === typeof contact) {
      contact = {login: contact}
      console.warn('Using string as contact', contact.login)
    }
    const url = `https://contacts.skype.com/contacts/v2/users/${this.username}/contacts/` + getMri(contact)
    const statusCode = await this.request('DELETE', url, null, ['X-Skypetoken'])
    contact.status = 200 === statusCode ? Status.DONE : Status.ABSENT
    return contact
  }

  async loadChats() {
    const url = 'https://client-s.gateway.messenger.live.com/v1/users/ME/conversations?' +
      'startTime=0&pageSize=200&view=msnp24Equivalent&targetType=Thread'
    const r = await this.request('GET', url, null, ['RegistrationToken'])
    if (r.conversations instanceof Array) {
      this.conversations = r.conversations.filter(c => 0 === c.id.indexOf('19:'))
    }
  }

  queryChatList() {
    return db.contact
      .filter(c => c.account === this.id && Type.CHAT === c.type)
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

  set contacts(contacts) {
    this.internal.contactsService.contacts = contacts
  }

  sendProfile() {
    const params = {id: this.id, v: packge_json.version}
    const profile = this.getProfile(['conversations'])
    if (!(profile.contacts instanceof Array)) {
      profile.contacts = []
    }
    profile.login = profile.id
    delete profile.id
    return api.send('skype/profile', params, profile)
  }

  sendUpdatedContacts() {
    if (this.updatedContacts.length > 0) {
      const maxLengths = {
        name: 192,
        city: 192,
        avatar: 192,
        mood: 192,
        site: 192,
        language: 24,
        phone: 24,
        about: 8192,
        email: 64,
      }
      for(const contact of this.updatedContacts) {
        for(const key in contact) {
          const value = contact[key]
          const length = maxLengths[key] / 2
          if ('string' === typeof value && maxLengths[key] && value.length > length) {
            contact[key] = value.slice(0, length)
          }
        }
      }
      api.send('skype/contacts', {account: this.id}, this.updatedContacts)
      this.updatedContacts = []
    }
  }
}
