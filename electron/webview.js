const {EventEmitter} = require('events')
const {extend} = require('lodash')

window.profiles = {}

function WebView() {
  EventEmitter.call(this)
  if (this.constructor.prototype !== WebView.prototype) {
    extend(this, WebView.prototype)
  }
  this.mid = 0
  this.addEventListener('console-message', (e) => {
    try {
      this.receiveData(JSON.parse(e.message))
    }
    catch (ex) {
    }
  })

  this.on('profile', function (profile) {
    console.log(profile)
  })
}

WebView.prototype = extend(Object.create(EventEmitter.prototype), {
  sendData(data) {
    data.mid = ++data.mid
    const string = JSON.stringify(data)
    this.executeJavaScript(`sky.receive(${string})`)
  },

  receiveData(data) {
    if ('string' === typeof data.type && data.mid > this.mid) {
      this.mid = data.mid
      this.emit(data.type, data)
    }
  }
})

WebView.create = function (partition = 'persist:taradox89') {
  const webview = document.createElement('webview')
  webview.setAttribute('src', 'https://web.skype.com')
  webview.setAttribute('preload', 'inject.js')
  webview.setAttribute('partition', partition)
  WebView.call(webview)
  webview.addEventListener('did-stop-loading', function () {
    this.openDevTools()
    this.setAudioMuted(true)
  })
  return webview
}

module.exports = WebView
//login('viktor.anatolievi4', 'bpfqywtrhenj!!!')
