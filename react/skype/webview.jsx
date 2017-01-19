import {EventEmitter} from 'events'
import {extend, isObject, sample, shuffle, toArray} from 'lodash'
window.isObject = function (obj) {
  console.error('Global isObject')
  return isObject(obj)
}

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

const userAgents = shuffle([
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:50.0) Gecko/20100101 Firefox/50.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36",
  "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36",
  "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.99 Safari/537.36 OPR/41.0.2353.69",
  "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:50.0) Gecko/20100101 Firefox/50.0",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/55.0.2883.87 Chrome/55.0.2883.87 Safari/537.36",
  "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:50.0) Gecko/20100101 Firefox/50.0",
])

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
  webview.setAttribute('useragent', sample(userAgents))
  if (partition) {
    webview.setAttribute('partition', partition)
  }
  WebView.call(webview)
  webview.addEventListener('did-stop-loading', function () {
    if (isDevMode) {
      this.openDevTools()
    }
    this.setAudioMuted(true)
  })
  return webview
}

module.exports = WebView
