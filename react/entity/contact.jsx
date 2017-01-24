import {extend, each, uniq, pick, filter, identity} from 'lodash'
import {EventEmitter} from 'events'
import db from '../database.jsx'
import {millisecondsId} from '../util/index.jsx'
import {Status} from '../../app/config'
import Query from '../store/query.jsx'

function createTextSearchFilter(text) {
  if (text && (text = text.trim())) {
    const words = text.split(/\s+/)
    return function (c) {
      return words.every(word =>
        c.login.indexOf(word) >= 0
        || (c.name && c.name.indexOf(word) >= 0)
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
    const searchTextFilter = createTextSearchFilter(params.search)

    const q = db.contact
      .where(pick(params, 'account', 'status', 'authorized'))

    if (searchTextFilter) {
      q.and(searchTextFilter)
    }

    return q
  },

  async request(params) {
    const result = {}

    if ('number' === typeof params.count) {
      result.count = await Contact.query(params).count()
    }

    if (0 === result.count) {
      result.contacts = []
      return result
    }

    const q = Contact.query(params)

    if (params.offset) {
      q.offset(params.offset)
    }

    if (params.limit) {
      q.limit(params.limit)
    }

    result.contacts = await q.toArray()

    return result
  },

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

  queries: {
    queue: {
      authorized: 0,
      status: Status.SELECTED
    },
  },

  selectAll(account, select) {
    return db.contact
      .filter(c => c.account === account)
      .modify({
        status: select ? Status.SELECTED : Status.CREATED
      })
  },

  queue() {
    return db.contact
      .where(this.queries.queue)
  },

  delete(id) {
    return db.contact.delete(id)
  },

  selectedQuery(account, selected) {
    return {
      account,
      authorized: 1,
      status: selected ? Status.SELECTED : Status.CREATED
    }
  },

  async pushQueue(usernames) {
    let contacts = []
    usernames = usernames.reduce((a, n) => (a[n] = n) && a, {})
    await db.contact.each(function ({login}) {
      if (usernames[login]) {
        usernames[login] = false
      }
    })
    usernames = filter(usernames).map(identity)
    if (usernames.length > 0) {
      contacts = usernames.map(login => ({
        login: login,
        status: Status.SELECTED,
        authorized: 0,
      }))
      contacts = this.setupMany(uniq(contacts))
      await db.contact.bulkAdd(contacts)
      Contact.emit('update')
    }
    return contacts
  }
});

Contact.queries.queuePage = new Query(Contact, {
  authorized: 0,
  status: Status.SELECTED
})

Contact.queries.otherPage = new Query(Contact, {
  authorized: 1,
  status: Status.CREATED
})

Contact.queries.selectedPage = new Query(Contact, {
  authorized: 1,
  status: Status.SELECTED
})

// Contact.delegate(db.contact, Query.proxy, ['orderBy'])
// db.Contact = Contact.proxy(db.contact)

EventEmitter.call(Contact)
extend(Contact, EventEmitter.prototype)

each(Contact.queries, function (query) {
  if (Contact === query.driver) {
    function update(params) {
      console.log(params)
      query.request(params)
    }

    query.listen = function (listener) {
      if (listener) {
        Contact.on('update', update)
      }
      else {
        Contact.removeListener('update', update)
      }
      this.listener = listener
    }
  }
})
