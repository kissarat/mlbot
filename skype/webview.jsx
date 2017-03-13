import config from '../app/config'
import {EventEmitter} from 'events'
import {extend, isObject, toArray} from 'lodash'
import UserAgent from '../util/user-agent.jsx'

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

EventEmitter.call(EventEmitter)
extend(WebView, EventEmitter.prototype)

WebView.prototype = extend({
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

  blank() {
    this.src = 'blank.html'
  },

  invoke(fn, args) {
    let formatted = []
    if (args instanceof Array) {
      args.forEach(function (a) {
        if ('string' === typeof a) {
          a = `'${a}'`
        }
        else if (isObject(a)) {
          a = JSON.stringify(a)
        }
        formatted.push(a)
      })
    }
    formatted = formatted.join(',')
    this.executeJavaScript(`${fn}(${formatted})`)
  },

  onMany(number, event, cb) {
    const handle = () => {
      const args = toArray(arguments)
      if (--number < 0) {
        this.removeEventListener(event, handle)
      }
      args.unshift(number)
      cb.apply(this, args)
    }
    this.on(event, handle)
  }
},
EventEmitter.prototype)

WebView.create = function (partition) {
  const webview = document.createElement('webview')
  webview.setAttribute('src', 'https://web.skype.com')
  webview.setAttribute('preload', 'js/inject.js')
  webview.setAttribute('useragent', UserAgent.random())
  if (partition) {
    webview.setAttribute('partition', partition)
  }
  WebView.call(webview)
  webview.addEventListener('did-stop-loading', function () {
    if (config.dev) {
      this.openDevTools()
    }
    this.setAudioMuted(true)
  })
  return webview
}

module.exports = WebView
