import load from './load.jsx'
import Skype from './webview.jsx'
import {extend, each} from 'lodash'
import Timeout from '../util/timeout.jsx'

function all(array) {
  return new Proxy(array, {
    get(array, p) {
      return function () {
        const args = arguments
        each(array, function (item) {
          item[p].apply(item, args)
        })
      }
    }
  })
}

extend(Skype, {
  load,

  get(username) {
    return document.querySelector(`#dark [partition="${username}"]`)
  },

  all(proxy = true) {
    const items = document.querySelectorAll(`#dark [partition]`)
    return proxy ? all(items) : items
  },

  removeAll() {
    // console.log('no Skype.all().remove()')
    Skype.all().remove()
  },

  async open(data, busy) {
    // if ('string' === typeof data) {
    //   data = await Skype.getAccount(data)
    // }
    let skype = Skype.get(data.login)
    if (!skype) {
      skype = await Skype.load(data, busy)
    }
    if (data.timeout && !(skype.setTimeout instanceof Function)) {
      extend(skype, Timeout)
      skype.timeoutDuration = data.timeout
      skype.setTimeout(function () {
        skype.remove()
      })
    }
    Skype.emit('open', {busy, skype, ...data})
    return skype
  },

  show(visible) {
    document.getElementById('app').style.display = visible ? 'none' : 'block'
    document.getElementById('back').style.display = visible ? 'none' : 'block'
    document.getElementById('dark').style.opacity = visible ? '1' : '0'
  },

  init() {
    Skype.dark = document.getElementById('dark')
  }
})

export default Skype
