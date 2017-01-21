import {extend} from 'lodash'
import {EventEmitter} from 'events'

export default class Contact {
  static buildQuery(account, status, search) {
    return function query(c) {
      let q = account === c.account &&
        status === c.status &&
        c.authorized
      search.split(/\s+/).forEach(function (word) {
        if (word) {
          q &= c.login.indexOf(word) >= 0
            || (c.display_name && c.display_name.indexOf(word) >= 0)
        }
      })
      return q
    }
  }

  static async search(account, status, search, offset) {
    const query = Contact.buildQuery(account, status, search)
    const count = await db.contact.filter(query).count()
    const contacts = await db.contact
      .filter(query)
      .offset(offset)
      .limit(15)
      .toArray()
    return {count, contacts}
  }

  static countAll() {
    return db.contact.count()
  }

  static clearAll() {
    return db.contact.delete()
  }
}

EventEmitter.call(Contact)
extend(Contact, EventEmitter.prototype)

window.Contact = Contact
