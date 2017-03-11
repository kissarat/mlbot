import db from '../react/database.jsx'
import Skype from '../react/skype/index.jsx'
import Skyweb from '../rat/src/skyweb.ts'
import SkypeAccount from '../rat/src/skype_account.ts'
import {extend} from 'lodash'
import {isSkypeUsername, millisecondsId} from '../react/util/index.jsx'
import {Type, Status} from '../app/config'

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
        this.internal.skypeAccount.selfInfo = {username: this.info.login}
        this.internal.skypeAccount.skypeToken = skype.headers['X-Skypetoken']
        console.log('Headers received!')
      }
    }
    return Promise.resolve(this.internal.skypeAccount)
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
      if (isSkypeUsername(c.id)) {
        const id = this.info.login + '~' + c.id
        const found = existing.find(x => id === x.id)
        const contact = {
          type: Type.PERSON,
          id,
          account: this.info.login,
          login: c.id,
          name: c.display_name,
          authorized: c.authorized ? 1 : 0,
          status: found ? found.status : Status.CREATED,
          time: found ? found.time : g.next().value
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

  async send(message) {

  }
}
