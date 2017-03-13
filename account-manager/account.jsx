import db from '../react/database.jsx'
import Skype from '../react/skype/index.jsx'
import Skyweb from '../rat/src/skyweb.ts'
import SkypeAccount from '../rat/src/skype_account.ts'
import {pick, xtend, isObject, isEmpty, identity} from 'lodash'
import {isSkypeUsername, millisecondsId} from '../react/util/index.jsx'
import {exclude, Type, Status} from '../app/config'

export default class Account {
  constructor(options) {
    this.info = options
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
        console.log('Headers received!')
      }
      if (this.internal.skypeAccount) {
        return Promise.resolve(this.internal.skypeAccount)
      }
      return Promise.reject()
    }
  }

  loadContacts() {
    return new Promise((resolve, reject) =>
      this.internal.contactsService.loadContacts(this.internal.skypeAccount, resolve, reject))
  }

  async saveContacts() {
    const contacts = []
    const existing = await db.contact
      .filter(c => this.info.login === c.account)
      .toArray()
    const g = millisecondsId()
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
          time: found ? found.time : g.next().value
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
    const cid = Type.CHAT === message.type
      ? `19:${message.login}@thread.skype`
      : '8:' + message.login
    return this.internal.sendMessage(cid, message.text)
  }
}
