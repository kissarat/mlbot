import {extend} from 'lodash'
import {EventEmitter} from 'events'

export default class Contact {
  static async search(account, status, search, offset) {
    function query(c) {
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

    const count = await db.contact.filter(query).count()
    const contacts = await db.contact
      .filter(query)
      .offset(offset)
      .limit(15)
      .toArray()
    return {count, contacts}
  }
}

EventEmitter.call(Contact)
extend(Contact, EventEmitter.prototype)

window.Contact = Contact
