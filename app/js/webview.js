const {EventEmitter} = require('events')
const {extend, isObject} = require('lodash')
const api = require('./api')
const config = require('./config')
const {clear} = require('./util')

window.profiles = {}

function WebView() {
  EventEmitter.call(this)
  if (this.constructor.prototype !== WebView.prototype) {
    extend(this, WebView.prototype)
  }
  this.addEventListener('console-message', (e) => {
    try {
      this.receiveData(JSON.parse(e.message))
    }
    catch (ex) {
    }
  })
}

WebView.prototype = extend(Object.create(EventEmitter.prototype), {
  sendData(data) {
    const string = JSON.stringify(data)
    this.executeJavaScript(`sky.receive(${string})`)
  },

  receiveData(data) {
    if ('string' === typeof data.type) {
      this.emit(data.type, data)
    }
    else {
      console.error('Data has no type', data)
    }
  },

  invoke(fn, args) {
    const formatted = []
    args.forEach(function (a) {
      if ('string' === typeof a) {
        a = `'${a}'`
      }
      else if (isObject(a)) {
        a = JSON.stringify(a)
      }
      formatted.push(a)
    })
    this.executeJavaScript(`${fn}(${formatted})`)
  },

  login(username, password) {
    this.invoke('login', [username, password])
  },

  getProfile() {
    return this.profile
      ? Promise.resolve(this.profile)
      : new Promise(resolve => this.once('profile', profile => {
        this.profile = profile
        clear(profile)
        profile.contacts.forEach(function (contact) {
          ['avatar_url', 'display_name_source', 'name', 'person_id', 'type'].forEach(function (key) {
            delete contact[key]
          })
        })
        resolve(profile)
      })
    )
  }
})

WebView.create = function (partition) {
  const webview = document.createElement('webview')
  webview.setAttribute('src', 'https://web.skype.com')
  webview.setAttribute('preload', 'js/inject.js')
  if (partition) {
    webview.setAttribute('partition', partition)
  }
  WebView.call(webview)
  webview.addEventListener('did-stop-loading', function () {
    console.log(this.getURL())
    if (config.dev) {
      this.openDevTools()
    }
    this.setAudioMuted(true)
  })
  return webview
}

module.exports = WebView
//login('viktor.anatolievi4', 'bpfqywtrhenj!!!')
