import db from '../react/database.jsx'
import Skyweb from '../rat/src/skyweb.ts'
import {extend} from 'lodash'
import {Type, Status} from '../app/config'
import {isSkypeUsername, millisecondsId} from '../react/util/index.jsx'

export default class Account {
  constructor(options) {
    this.info = options
  }

  async login() {
    if (!this.internal) {
      this.internal = new Skyweb()
      await this.internal.login(this.info.login, this.info.password)
    }
    return Promise.resolve(this.internal.skypeAccount)
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
