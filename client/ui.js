const {extend, each} = require('lodash')

class Emitter {
  constructor() {
    Emitter.mix(this)
  }

  static mix(object) {
    object._events = {}
  }

  on(eventName, listener) {
    let listeners = this._events[eventName]
    if (!listeners) {
      listeners = this._events[eventName] = []
    }
    listeners.push(listener)
    return this
  }

  emit(eventName) {
    const listeners = this._events[eventName]
    if (listeners) {
      const args = [].slice.call(arguments, 1)
      listeners.forEach(listener => listener.apply(this, args))
      return true
    }
    return false
  }
}

function $$(selector) {
  return document.querySelector(selector)
}

function $all(selector) {
  return document.querySelectorAll(selector)
}

function $id(id) {
  return document.getElementById(id)
}

function $new(tag, attributes, children) {
  if (!children && attributes instanceof Array || attributes instanceof Element) {
    children = attributes
    attributes = null
  }
  const element = document.createElement(tag)
  if ('string' === typeof attributes) {
    element.setAttribute('class', attributes)
  }
  else {
    each(attributes, function (value, name) {
      if ('boolean' === typeof value) {
        element[name] = value
      }
      else {
        element.setAttribute(name, value)
      }
    })
  }
  if ('string' === typeof children) {
    element.innerHTML = children
  }
  else if (children instanceof Element) {
    element.appendChild(children)
  }
  else {
    each(children, function (child) {
      element.appendChild(child)
    })
  }
  return element
}

function bar(events) {
  each(events, function (fn, id) {
    $id(id).addEventListener('click', fn)
  })
}

function keydown(key, code) {
  if (!code) {
    code = key.charCodeAt(0)
  }
  this.dispatchEvent(new KeyboardEvent('keydown', {key, code: key, charCode: code, keyCode: code}))
}

function keyup(key, code) {
  if (!code) {
    code = key.charCodeAt(0)
  }
  this.dispatchEvent(new KeyboardEvent('keyup', {key, code: key, charCode: code, keyCode: code}))
}

function keypress(key, code) {
  if (!code) {
    code = key.charCodeAt(0)
  }
  this.dispatchEvent(new KeyboardEvent('keypress', {key, code: key, charCode: code, keyCode: code}))
}

class Sky extends Emitter {
  receive(data) {
    if ('string' === typeof data.type) {
      this.emit(data.type, data)
    }
    else {
      console.error('Data has no type', data)
    }
  }

  send(data) {
    console.log(JSON.stringify(data))
  }
}

extend(window, {$$, $all, $id, $new, bar, keydown, keyup, keypress, Emitter, Sky})
if (!window.sky) {
  window.sky = new Sky();
}

['map', 'forEach', 'filter'].forEach(function (fn) {
  NodeList.prototype[fn] = Array.prototype[fn]
  HTMLFormControlsCollection.prototype[fn] = Array.prototype[fn]
})

extend(Element.prototype, {
  keydown,
  keyup,
  keypress,
  show() {
    this.style.display = 'block'
    return this
  },

  hide() {
    this.style.display = 'none'
    return this
  },

  attach() {
    if (this._parent) {
      if (this._nextSibling) {
        this._parent.insertBefore(this, this._nextSibling)
        delete this._nextSibling
      }
      else {
        this._parent.appendChild(this)
      }
      delete this._parent
    }
    else {
      console.error('Parent not defined')
    }
  },

  detach() {
    this._parent = this.parentNode
    const nextSibling = this.nextSibling
    if (nextSibling) {
      this._nextSibling = nextSibling
    }
    this.remove()
  },

  append(array) {
    const fragment = document.createDocumentFragment()
    array.forEach(function (element) {
      fragment.appendChild(element)
    })
    this.appendChild(fragment)
  },

  findParent(cb) {
    if (this.parentNode) {
      return cb(this.parentNode)
        ? this.parentNode
        : this.parentNode.findParent(cb)
    }
    return false
  },

  findParentByTag(name) {
    name = name.toUpperCase()
    return this.findParent(function (element) {
      return name === element.tagName
    })
  }
})

Object.defineProperties(Element.prototype, {
  isVisible: {
    get() {
      return 'none' === this.style.display
    },

    set(value) {
      this.style.display = value ? 'block' : 'none'
    }
  }
})

extend(HTMLFormElement.prototype, Emitter.prototype)
extend(HTMLFormElement.prototype, {
  init(events) {
    EventEmitter.call(this)
    each(events, (fn, name) => this.on(name, fn))
    this.addEventListener('submit', (e) => {
      e.preventDefault()
      this.emit('submit', this.toJSON())
    })
    return this
  },

  toJSON() {
    const object = {}
    this.elements.forEach(function (input) {
      if (input.hasAttribute('name')) {
        object[input.getAttribute('name')] = input.value
      }
    })
    return object
  }
})

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

delete window.Notification
delete window.ServiceWorker
delete window.ServiceWorkerContainer
