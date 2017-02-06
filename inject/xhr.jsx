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

  invite(username, greeting = '') {
    return fetch(`https://contacts.skype.com/contacts/v2/users/${this.profile.username}/contacts`, {
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
    return fetch(`https://contacts.skype.com/contacts/v2/users/${this.profile.username}/contacts/8:`)
      .then(() => fetch('https://client-s.gateway.messenger.live.com/v1/users/ME/contacts/8:'))
  }
})

extend(window, {
  invite(username) {
    sky.invite(username)
      .then(function ({status}) {
        status = 404 === status ? Status.ABSENT : Status.INVITED
        sky.send({
          type: 'invite',
          username,
          status
        })
      })
  },

  removeContact(username) {
    sky.removeContact()
      .then(() => sky.send({
        type: 'contact.remove',
        username
      }))
  }
})

XMLHttpRequest.prototype.open = function (method, url) {
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
      sky.profile.v = 1
      sky.profile.type = 'profile'
      sky.send(sky.profile)
    })
  }

  if (sky.profile && sky.RegistrationToken && sky.token) {
    sky.emit('token')
    sky.profile.token = sky.token
    sky.profile.token = sky.RegistrationToken
    sky.fetchOptions.headers['X-Skypetoken'] = sky.token
    sky.fetchOptions.headers.RegistrationToken = sky.RegistrationToken
    XMLHttpRequest.prototype.open = XHROpen

    sky.getContacts(sky.profile.username)
      .then(function ({contacts}) {
        sky.profile.contacts = contacts
        sky.profile.type = 'contacts'
        sky.send(sky.profile)
      })
  }
  XHROpen.apply(this, arguments)
}
