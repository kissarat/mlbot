import {sky} from './sky.jsx'
import {defaultsDeep, merge, extend} from 'lodash'
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

XMLHttpRequest.prototype.open = function (method, url, async) {
  this.setRequestHeader = function (key, value) {
    if ('X-Skypetoken' === key) {
      sky.token = value
    }
    if ('RegistrationToken' === key) {
      sky.RegistrationToken = value
    }
    XMLHttpRequest.prototype.setRequestHeader.call(this, key, value)
  }

  if ('https://api.skype.com/users/self/profile' === url && 'GET' === method && !sky.profile && sky.token) {
    this.addEventListener('load', function () {
      sky.profile = JSON.parse(this.responseText)
      window.sky.profile = sky.profile
      sky.profile.v = 1
      sky.profile.type = 'profile'
      sky.send(sky.profile)
    })
  }

  /*
  const conversationsURL = /\/users\/ME\/conversations\?.*view=(\w+)/.exec(url)
  if (conversationsURL) {
    url = url.replace(/&pageSize=\d+/, '')
    sky.view = conversationsURL[1]
    this.addEventListener('load', function (e) {
      const {conversations} = JSON.parse(e.target.responseText)
      sky.conversations = conversations
    })
  }
  */

  if (sky.profile && sky.RegistrationToken && sky.token) {
    sky.emit('token')
    sky.profile.token = sky.token
    sky.profile.token = sky.RegistrationToken
    sky.fetchOptions.headers['X-Skypetoken'] = sky.token
    sky.fetchOptions.headers.RegistrationToken = sky.RegistrationToken
    XMLHttpRequest.prototype.open = XHROpen

    Promise.all([sky.getContacts(sky.profile.username), sky.getChatConversations()])
      .then(function ([{contacts}, {conversations}]) {
        sky.profile.contacts = contacts
        sky.profile.conversations = conversations
        sky.profile.type = 'contacts'
        sky.send(sky.profile)
      })
  }
  XHROpen.call(this, method, url, async)
}
