import {defaultsDeep, merge, extend} from 'lodash'
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
    return sky.fetch(`https://contacts.skype.com/contacts/v1/users/${username}/contacts`)
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

  removeContact(username) {
    sky.removeContact(username)
      .then(() => sky.send({
        type: 'contact.remove',
        username
      }))
  }
})

const neededHeaders = ['X-Skypetoken', 'RegistrationToken']

XMLHttpRequest.prototype.open = function (method, url, async) {
  this.setRequestHeader = function (key, value) {
    if (neededHeaders.indexOf(key) >= 0) {
      sky.fetchOptions.headers[key] = value
    }
    XMLHttpRequest.prototype.setRequestHeader.call(this, key, value)
  }

  if ('https://api.skype.com/users/self/profile' === url && 'GET' === method && !sky.profile && sky.fetchOptions.headers['X-Skypetoken']) {
    this.addEventListener('load', function () {
      sky.profile = JSON.parse(this.responseText)
      sky.profile.v = 1
      sky.profile.type = 'profile'
      sky.send(sky.profile)
    })
  }

  // console.log('url', sky.fetchOptions.headers)
  if (neededHeaders.every(h => (h = sky.fetchOptions.headers[h]) && h.length > 0)) {
    const headers = merge(sky.fetchOptions.headers, {
      Cookie: document.cookie,
      'User-Agent': navigator.userAgent
    })
    sky.send({type: 'token', headers})
    sky.profile.headers = headers
    XMLHttpRequest.prototype.open = XHROpen

    if ('https://api.skype.com/users/self/profile' === url) {

    }

    if ('https://client-s.gateway.messenger.live.com/v1/users/ME/endpoints/SELF/subscriptions/0/poll' === url) {
      console.log(url)
      this.send = Function()
    }

    /*
     sky.getContacts(sky.profile.username)
     .then(({contacts}) => {
     sky.profile.contacts = contacts
     sky.profile.conversations = conversations
     sky.profile.type = 'contacts'
     sky.send(sky.profile)
     })
     */
  }
  XHROpen.call(this, method, url, async)
}
