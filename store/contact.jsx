import db from './database.jsx'
import {EventEmitter} from 'events'
import {extend, each, uniq, pick, filter, identity, isEmpty} from 'lodash'
import {filterSkypeUsernames} from '../util/index.jsx'
import {millisecondsId} from '../util/index.jsx'
import {Status, Type} from '../app/config'

function createTextSearchFilter(text) {
  if (text && (text = text.trim())) {
    const words = text.toLowerCase().split(/\s+/)
    return function (c) {
      return words.every(word =>
        c.login.indexOf(word) >= 0
        || (c.name && c.name.toLowerCase().indexOf(word) >= 0)
      )
    }
  }
}

export default function Contact() {

}

Contact.prototype = {}

extend(Contact, {
  countAll() {
    return db.contact.count()
  },

  query(params) {
    Object.freeze(params.type)

    const searchTextFilter = createTextSearchFilter(params.search)

    const picked = pick(params, 'account', 'status', 'authorized')
    const pickedIsEmpty = isEmpty(picked)
    const q = pickedIsEmpty ? db.contact : db.contact.where(picked)
    if ('number' === typeof params.type) {
      q.filter(c => params.type === c.type)
    }

    if (params.group) {
      q.filter(c => c.groups.indexOf(params.group) >= 0)
    }

    if (searchTextFilter) {
      q.and(searchTextFilter)
    }

    return q
  },

  async request(params) {
    const result = {}

    result.count = await Contact.query(params).count()
    if (result.count > 0) {
      result.contacts = await Contact.query(params)
        .offset(params.offset)
        .limit(params.limit)
        .toArray()
    }
    else (
      result.contacts = []
    )

    return result
  },

  setup(contact) {
    contact.id = contact.account ? contact.account + '~' + contact.login : contact.login
    contact.authorized = contact.authorized ? 1 : 0
    if ('number' !== typeof contact.status) {
      contact.status = Status.NONE
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

  selectAll(account, select) {
    return db.contact
      .filter(c => c.account === account)
      .modify({
        status: select ? Status.SELECTED : Status.NONE
      })
  },

  queue() {
    return db.contact
      .where({
        authorized: 0,
        status: Status.SELECTED
      })
      .filter(c => Type.PERSON === c.type)
  },

  delete(id) {
    return db.contact.delete(id)
  },

  selectedQuery(account, selected) {
    return {
      account,
      authorized: 1,
      status: selected ? Status.SELECTED : Status.NONE
    }
  },

  async pushQueue(usernames) {
    let contacts = []
    usernames = filterSkypeUsernames(usernames)
    if (usernames.length > 0) {
      usernames = usernames.reduce((a, n) => (a[n] = n) && a, {})
      await db.contact.each(function ({login}) {
        if (usernames[login]) {
          usernames[login] = false
        }
      })
      usernames = filter(usernames).map(identity)
      if (usernames.length > 0) {
        contacts = usernames.map(login => ({
          authorized: 0,
          login: login,
          status: Status.SELECTED,
          type: Type.PERSON,
        }))
        contacts = this.setupMany(uniq(contacts))
        await db.contact.bulkAdd(contacts)
        Contact.emit('update')
      }
      return contacts
    }
  }
});

EventEmitter.call(Contact)
extend(Contact, EventEmitter.prototype)
