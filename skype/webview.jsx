import  config from '../app/config'
import {EventEmitter} from 'events'
import {extend, isObject, toArray, defaults} from 'lodash'
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
    // console.log(data)
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

  invoke(fn, args = []) {
    args = args.map(a => undefined === a ? 'undefined' : JSON.stringify(a)).join(',')
    this.executeJavaScript(`${fn}(${args})`)
  },

  promise(options) {
    return new Promise((resolve, reject) => {
      defaults(options, {
        timeout: this.timeout
      })
      const timer = setTimeout(() => {
        this.reload()
        reject(new Error(`Web Skype не отвечат ${options.timeout/1000} секунд`))
      }, options.timeout)
      this.once(options.event || options.action, function (data) {
        if (data.error) {
          reject(data)
        }
        else {
          clearTimeout(timer)
          resolve(data)
        }
      })
      const string = JSON.stringify(options)
      console.log('INVOKE', options)
      this.executeJavaScript(`sky.${options.action}(${string})`)
    })
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

export default WebView
