import {extend, matches, debounce} from 'lodash'
import {EventEmitter} from 'events'
import db from '../database.jsx'
import {millisecondsId} from '../util/index.jsx'
import {Status} from '../../app/config'

export default class Contact {
  static async search(condition, search, {sort, offset, limit = 15}) {
    function filter(q) {
      return 'function' === typeof condition
        ? q.filter(condition) : q.where(condition)
    }
    const count = await filter(db.contact).count()
    if (count <= 0) {
      return {count: 0, contacts: []}
    }
    let q = db.contact
    if (sort) {
      q = q.orderBy(sort).filter(condition)
    }
    else {
      q = filter(q)
    }
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

  static setup(contact) {
    contact.id = contact.account ? contact.account + '~' + contact.login : contact.login
    contact.authorized = contact.authorized ? 1 : 0
    if ('number' !== typeof contact.status) {
      contact.status = Status.CREATED
    }
    return contact
  }

  static setupMany(contacts) {
    const g = millisecondsId()
    return contacts.map(function (c) {
      c = Contact.setup(c)
      if ('number' !== typeof c.time) {
        c.time = g.next().value
      }
      return c
    })
  }
}

EventEmitter.call(Contact)
extend(Contact, EventEmitter.prototype)

window.Contact = Contact
