require('../client/ui')
const WebView = require('./webview')
const api = require('./api')

const skypes = {}

const expires = new Date()
expires.setMonth(expires.getMonth() + 6)
api.send('handshake/' + Date.now(), {type: 'app', expires: expires.toISOString()})
  .then(function (config) {
    api.setToken(config.token.id)
    main(config)
  })

function main(config) {
  if (config.user) {
    appLayout()
  }
  else {
    $id('root').place('#login').init({
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
      $id('dark').appendChild(skype)
    }
  })
}
