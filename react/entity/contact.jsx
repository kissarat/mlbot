import {extend, matches, debounce, each} from 'lodash'
import {EventEmitter} from 'events'
import db from '../database.jsx'
import {millisecondsId} from '../util/index.jsx'
import {Status} from '../../app/config'

export function factory(object) {
 object.proxy = function proxy(target) {
    return new Proxy(target, {
      has(target, key) {
        return key in target || key in object
      },

      get(target, key) {
        return target[key] || object[key]
      },

      enumerate(target) {
        return Object.keys(target).concat(Object.keys(object))
      }
    })
  }

  object.delegate = function delegate(target, methods) {
    (methods || Object.keys(target)).forEach(function (key) {
      object[key] = function _delegate() {
        return object.proxy(target[key].apply(target, arguments))
      }
    })
  }

  object.decorate = function _decorate(target, methods) {
    methods.forEach(function (key) {

    })
  }
}

function decorate(target, methods, decorator) {
  (methods || Object.keys(target)).forEach(function (method) {
    const fn = target[method]
    target[method] = decorator(fn)
  })
}

['orderBy'].forEach(function (key) {
  Contact[key] = function () {
    return Query.proxy(db.contact[key].apply(db.contact, arguments))
  }
})

export function proxyFactory(wrapper) {

}

export function Query() {
}

Query.prototype = {
  search(text) {
    if (text && (text = text.trim())) {
      return this.filter(c => {
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

extend(Query, {
  proxy: proxyFactory(Query.prototype)
})

export function Contact() {

}

extend(Contact, {
  async search(condition, search, {sort, offset, limit = 15}) {
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

    const contacts = await q
      .offset(offset)
      .limit(limit)
      .toArray()
    return {count, contacts}
  },

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

  classProxy: proxyFactory(Contact)
});


db.Contact = Contact.classProxy(db.contact)

EventEmitter.call(Contact)
extend(Contact, EventEmitter.prototype)

extend(window, exports)
