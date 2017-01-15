import {sky} from './sky.jsx'
import {defaultsDeep, extend} from 'lodash'

const XHROpen = XMLHttpRequest.prototype.open

sky.fetchOptions = {
  mode: 'cors',
  headers: {}
}

extend(sky, {
  fetch(url, options) {
    return fetch(url, defaultsDeep(options, sky.fetchOptions))
      .then(a => a.json())
  },

  getContacts(username) {
    return sky.fetch(`https://contacts.skype.com/contacts/v1/users/${username}/contacts`)
  },

  accept(username) {
    // return sky.fetch(`https://api.skype.com/users/self/contacts/auth-request/${username}/accept`)
    // return sky.fetch('https://client-s.gateway.messenger.live.com/v1/users/ME/contacts/' + username)
    // return sky.fetch(`https://contacts.skype.com/contacts/v2/users/${sky.profile.username}/invites/${username}/accept`, {
    //   method: 'PUT'
    // })
    return sky.fetch(`https://contacts.skype.com/contacts/v2/users/${this.profile.username}/contacts`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        mri: '8:' + username,
        greeting: 'Hello'
      })
    })
  }
})

extend(window, {
  accept(username) {
    sky.accept(username)
      .then(function (json) {
        json.type = 'accept'
        console.log(json)
      })
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
    })
  }

  if (sky.RegistrationToken && sky.token) {
    sky.profile.token = sky.token
    sky.profile.token = sky.RegistrationToken
    sky.fetchOptions.headers['X-Skypetoken'] = sky.token
    sky.fetchOptions.headers.RegistrationToken = sky.RegistrationToken
    XMLHttpRequest.prototype.open = XHROpen

    sky.getContacts(sky.profile.username)
      .then(function ({contacts}) {
        sky.profile.contacts = contacts
        sky.send(sky.profile)
      })
  }
  XHROpen.apply(this, arguments)
}
