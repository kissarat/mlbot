import {extend, matches, debounce} from 'lodash'
import {EventEmitter} from 'events'
import db from '../database.jsx'

export default class Contact {
  static async search(condition, search, {offset, limit = 15}) {
    const count = await db.contact.where(condition).count()
    let q = db.contact
      .where(condition)
    if (search && (search = search.trim())) {
        q = q.filter(function (c) {
          let r = false
          search.split(/\s+/).forEach(function (word) {
            if (word) {
              r |= c.login.indexOf(word) >= 0
                || (c.name && c.name.indexOf(word) >= 0)
            }
          })
          return r
        })
    }
    const contacts = await q
      .offset(offset)
      .limit(limit)
      .toArray()
    return {count, contacts}
  }

  static countAll() {
    return db.contact.count()
  }

  // static clearAll() {
  //   return db.contact.delete()
  // }

  static async filter(query) {
    const result = await db.contact.filter(query)
    this.omit('upload')
    return result
  }

  static hook
}

EventEmitter.call(Contact)
extend(Contact, EventEmitter.prototype)

window.Contact = Contact
