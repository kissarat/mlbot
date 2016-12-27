require('./js/ui')
const WebView = require('./js/webview')
const api = require('./js/api')
const {clear} = require('./js/util')

const skypes = {}

const expires = new Date()
expires.setMonth(expires.getMonth() + 6)
api.send('handshake/' + Date.now(), {type: 'app', expires: expires.toISOString()})
  .then(function (config) {
    api.setToken(config.token.id)
    main(config)
  })

function main(config) {
  if (config.user.guest) {
    $id('root').place('#login').$$('form').init({
      submit(inData) {
        api.send('user/login/' + inData.email, inData)
          .then(function (outData) {
            if (outData.success) {
              appLayout()
            }
          })
      }
    })
  }
  else {
    appLayout()
  }
}

function appLayout() {
  $id('root').place('#app-layout')
  bar({
    addSkype: skypeLogin
  })
}

function skypeLogin() {
  $id('main').place('#skype-login').init({
    submit(data) {
      const skype = WebView.create(data.login)
      skype.once('load', function () {
        skype.login(data.login, data.password)
        skype.once('load', function () {
          skype.login(data.login, data.password)
          skype.once('profile', function(profile) {
            $$('aside ul').add('li', profile.username)
            profile.password = data.password
            clear(profile)
            profile.contacts.forEach(function (contact) {
              ['avatar_url', 'display_name_source', 'name', 'person_id', 'type'].forEach(function (key) {
                delete contact[key]
              })
            })
            profiles[profile.username] = profile
            api.send('skype/profile', {id: profile.username}, profile)
              .then(function () {
                $id('main').place('#tabs-layout')
              })
          })
        })
      })
      $id('dark').appendChild(skype)
    }
  })
}
