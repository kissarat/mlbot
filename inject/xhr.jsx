import {defaultsDeep, merge, extend, pick} from 'lodash'
import {sky} from './sky.jsx'
import {Status} from '../app/config'

const XHROpen = XMLHttpRequest.prototype.open

sky.fetchOptions = {
  mode: 'cors',
  headers: {}
}

extend(sky, {
  fetch(url, options) {
    return fetch(url, defaultsDeep(options, sky.fetchOptions))
      .then(function (r) {
        const type = r.headers.get('content-type')
        if (type && type.indexOf('json') > 0) {
          return r.json()
        }
      })
  },

  getContacts(username) {
    // return sky.fetch(`https://contacts.skype.com/contacts/v1/users/${username}/contacts`)
    return sky.fetch(`https://contacts.skype.com/contacts/v2/users/${username}?delta&reason=default`)
  },

  getChatConversations() {
    return sky.fetch('https://client-s.gateway.messenger.live.com/v1/users/ME/conversations?view=msnp24Equivalent&targetType=Thread')
  },

  getMembers(chatId) {
    return sky.fetch(`https://client-s.gateway.messenger.live.com/v1/threads/19:${chatId}@thread.skype?view=msnp24Equivalent`)
  },

  invite(username, greeting = '') {
    return fetch(`https://contacts.skype.com/contacts/v2/users/${sky.profile.username}/contacts`, {
      method: 'POST',
      headers: merge(sky.fetchOptions.headers, {
        'content-type': 'application/json'
      }),
      body: JSON.stringify({
        mri: '8:' + username,
        greeting
      })
    })
  },

  removeContact(username) {
    const fetch = url => this.fetch(url + username, {
      method: 'DELETE'
    })
    return fetch(`https://contacts.skype.com/contacts/v2/users/${sky.profile.username}/contacts/8:`)
      .then(() => fetch('https://client-s.gateway.messenger.live.com/v1/users/ME/contacts/8:'))
  }
})

extend(window, {
  invite(username, greeting) {
    sky.invite(username, greeting)
      .then(function ({status}) {
        status = 404 === status ? Status.ABSENT : Status.INVITED
        sky.send({
          type: 'invite',
          username,
          status
        })
      })
  },

  getMembers(chatId) {
    sky.getMembers(chatId)
      .then(function (r) {
        r.type = 'getMembers'
        sky.send(r)
      })
  },

  getChatConversations() {
    sky.getChatConversations()
      .then(function (r) {
        r.type = 'getChatConversations'
        sky.send(r)
      })
  },

  getContacts(id) {
    sky.getContacts(id)
      .then(({contacts, groups}) => sky.send({
        type: 'getContacts',
        id,
        contacts,
        groups
      }))
  },

  removeContact(username) {
    sky.removeContact(username)
      .then(() => sky.send({
        type: 'contact.remove',
        username
      }))
  },

  getPerformance() {
    sky.send({
      type: 'getPerformance',
      memory: pick(performance.memory, 'jsHeapSizeLimit', 'totalJSHeapSize', 'usedJSHeapSize')
    })
  }
})

let neededHeaders = ['X-Skypetoken', 'RegistrationToken']
window.abcd = {}

XMLHttpRequest.prototype.open = function (method, url, sync) {
  const xhr = this
  if (neededHeaders) {
    this.setRequestHeader = function (key, value) {
      if (neededHeaders.indexOf(key) >= 0) {
        sky.fetchOptions.headers[key] = value
      }
      XMLHttpRequest.prototype.setRequestHeader.call(this, key, value)
    }

    // console.log('url', sky.fetchOptions.headers)
    if (neededHeaders.every(h => (h = sky.fetchOptions.headers[h]) && h.length > 0)) {
      const headers = merge(sky.fetchOptions.headers, {
        Cookie: document.cookie,
        'User-Agent': navigator.userAgent
      })
      sky.send({type: 'token', headers})
      sky.profile.headers = headers
      neededHeaders = false
      // XMLHttpRequest.prototype.open = XHROpen
    }
  }


  const isContacts = 0 === url.indexOf('https://contacts.skype.com/contacts/v2/users/') && url.indexOf('/invites') < 0
  if (isContacts && 'GET' === method) {
    this.addEventListener('load', function () {
      const {contacts, groups} = JSON.parse(this.responseText)
      if (contacts instanceof Array) {
        sky.send({
          type: 'contacts',
          contacts,
          groups
        })
      }
      else {
        console.error('Unknown contacts response', this.responseText)
      }
    })
  }

  const isConversations = 0 == url.indexOf('https://client-s.gateway.messenger.live.com/v1/users/ME/conversations')
    && url.indexOf('/messages') < 0
  if (isConversations && 'GET' === method) {
    this.addEventListener('load', function () {
      const {conversations} = JSON.parse(this.responseText)
      if (conversations instanceof Array) {
        sky.send({
          type: 'conversations',
          conversations
        })
      }
      else {
        console.error('Unknown conversations response', this.responseText)
      }
    })
  }

  if ('https://client-s.gateway.messenger.live.com/v1/users/ME/endpoints/SELF/subscriptions/0/poll' === url) {
    console.log(url)
    this.send = Function()
  }

  if ('https://api.skype.com/users/self/profile' === url && 'GET' === method && !sky.profile && sky.fetchOptions.headers['X-Skypetoken']) {
    this.addEventListener('load', function () {
      sky.profile = JSON.parse(this.responseText)
      sky.profile.v = 1
      sky.profile.type = 'profile'
      sky.send(sky.profile)
    })
  }

  XHROpen.call(this, method, url, sync)
}
