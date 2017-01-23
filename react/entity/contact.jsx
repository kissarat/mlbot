import {extend, matches, debounce, each, identity, uniq} from 'lodash'
import {EventEmitter} from 'events'
import db from '../database.jsx'
import {millisecondsId} from '../util/index.jsx'
import {Status} from '../../app/config'

export function factory(object) {
  function delegate(target, proxy, methods) {
    (methods || Object.keys(object)).forEach(function (key) {
      object[key] = function _delegate() {
        return proxy(target[key].apply(this, arguments))
      }
    })
  }

  function decorate(target, methods, decorator) {
    (methods || Object.keys(target)).forEach(function (method) {
      const fn = target[method]
      target[method] = decorator(fn)
    })
  }

  function proxy(target) {
    return new Proxy(target, {
      has(target, key) {
        return key in target || key in object
      },

      get(target, key) {
        if ('name' === key) {
          return target.name
        }
        return object[key] || target[key]
      }
    })
  }

  return {delegate, decorate, proxy}
}

export function Query() {
}

Query.prototype = {
  search(text) {
    if (text && (text = text.trim())) {
      return this.and(c => {
        let r = false
        text.split(/\s+/).forEach(word => {
          if (word) {
            r |= c.login.indexOf(word) >= 0
              || (c.name && c.name.indexOf(word) >= 0)
          }
        })
        return r
      })
    }
    return this
  }
}

db.Collection.prototype.search = search

extend(Query, factory(Query.prototype))

export default function Contact() {
}

Contact.prototype = {}

extend(Contact, factory(Contact), {
  countAll() {
    return db.contact.count()
  },

  // static clearAll() {
  //   return db.contact.delete()
  // }

  setup(contact) {
    contact.id = contact.account ? contact.account + '~' + contact.login : contact.login
    contact.authorized = contact.authorized ? 1 : 0
    if ('number' !== typeof contact.status) {
      contact.status = Status.CREATED
    }
    return contact
  },

  setupMany(contacts) {
    const g = millisecondsId()
    return contacts.map(function (c) {
      c = Contact.setup(c)
      if ('number' !== typeof c.time) {
        c.time = g.next().value
      }
      return c
    })
  },

  queue() {
    return this
      .orderBy('time')
      .filter(c => Status.SELECTED === c.status && 0 === c.authorized)
  },

  async pushQueue(usernames) {
    // usernames = uniq(usernames)
    const victims = []
    // await db.contact.each(function ({login}) {
    //   if (!usernames.find(name => name === login)) {
    //     victims.push(name)
    //   }
    // })
    usernames = usernames.reduce((a, n) => a[n] = n, {})
    await db.contact.each(function ({login}) {
      if (!usernames[login]) {
        victims.push(login)
      }
    })
    if (usernames.length > 0) {
      const contacts = uniq(victims).map(c => ({
        login: c.login,
        status: Status.SELECTED,
        authorized: 0,
      }))
      await db.contact.bulkAdd(this.setupMany(contacts))
      Contact.emit('update')
    }
  }
});

// Contact.delegate(db.contact, Query.proxy, ['orderBy'])
// db.Contact = Contact.proxy(db.contact)

EventEmitter.call(Contact)
extend(Contact, EventEmitter.prototype)

extend(window, exports)
