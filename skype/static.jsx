import Skype from './webview.jsx'
import {extend, each} from 'lodash'

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
  get(username) {
    return document.querySelector(`#dark [partition="${username}"]`)
  },

  all(proxy = true) {
    const items = document.querySelectorAll(`#dark [partition]`)
    return proxy ? all(items) : items
  },

  close(id) {
    const webview = Skype.get(id)
    if (webview) {
      webview.remove()
    }
  },

  closeAll() {
    document.getElementById('dark').innerHTML = ''
  },

  open(data) {
    let skype = Skype.get(data.id) || Skype.create(data.id)
    Skype.emit('open', {skype, ...data})
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
