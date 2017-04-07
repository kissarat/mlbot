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
import {pick, defaults, extend, isObject, isEmpty, identity, merge} from 'lodash'
import {Type, Status} from '../app/config'

function AccountBase() {
}

AccountBase.prototype = {
  __proto__: config.account,
  ...saveFunctions
}

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
    extend(this, EventEmitter.prototype)
    EventEmitter.call(this)
    this._lastId = Date.now()
    if (options) {
      options = pick(options, 'id', 'password', 'desktop', 'web', 'min', 'max', 'max_invite', 'headers')
      extend(this, desktop, options)
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
    await Skype.open(this)
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
    this.getCookies(uri).map(({key, value}) => key + '=' + value).join('; ')
  }

  /**
   * @param {string} method
   * @param {string} uri
   * @param {Object} body
   * @param {string[]} headerNames
   * @return {Promise}
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
      return r.json()
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
    let contacts
    if (this.web && this.skype) {
      contacts = await this.skype.getContacts()
    }
    else {
      contacts = await new Promise((resolve, reject) =>
        this.internal.contactsService.loadContacts(this.internal.skypeAccount, resolve, err => {
          console.error('CANNOT LOAD CONTACTS', this.id, err)
          reject(err)
        }))
    }
    return contacts
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
      console.log(message.type, message.login, message.text)
      return this.skype.sendMessage(message)
    }
    else {
      const mri = getMri(message)
      return this.request('POST', `https://client-s.gateway.messenger.live.com/v1/users/ME/conversations/${mri}/messages`, {
          content: message.text,
          messagetype: 'RichText',
          contenttype: 'text'
        },
        ['RegistrationToken'])
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
    const {conversations} = await this.request('GET', url, null, ['RegistrationToken'])
    if (conversations instanceof Array) {
      this.conversations = conversations.filter(c => 0 === c.id.indexOf('19:'))
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

  async sendProfile(data) {
    const params = {id: this.id, v: packge_json.version}
    const profile = this.getProfile(['contacts', 'conversations'])
    profile.login = profile.id
    delete profile.id
    return api.send('skype/profile', params, defaults(profile, data))
  }
}
