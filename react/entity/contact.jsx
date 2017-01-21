import {extend, matches, debounce} from 'lodash'
import {EventEmitter} from 'events'
import db from '../database.jsx'

export default class Contact {
  static buildQuery(condition, search) {
    const predicate = matches(condition)
    if (search) {
      return predicate
    }
    return function query(c) {
      let r = predicate(c)
      search.split(/\s+/).forEach(function (word) {
        if (word) {
          r &= c.login.indexOf(word) >= 0
            || (c.name && c.name.indexOf(word) >= 0)
        }
      })
      return r
    }
  }

  static async search(condition, search, {offset, limit = 15}) {
    // console.log(condition, search, offset, limit)
    // const query = Contact.buildQuery(condition, search)
    // const query = Contact.buildQuery(condition, search)
    const count = await db.contact.where(condition).count()
    const contacts = await db.contact
      .where(condition)
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
