import {extend, each, isObject} from 'lodash'
import {Emitter} from './sky.jsx'

export function $$(selector) {
  return document.querySelector(selector)
}

export function $all(selector) {
  return document.querySelectorAll(selector)
}

export function $id(id) {
  return document.getElementById(id)
}

export function $new(tag, attributes, children) {
  if (!children && attributes instanceof Array || attributes instanceof Element) {
    children = attributes
    attributes = null
  }
  const element = document.createElement(tag)
  if ('string' === typeof attributes) {
    if (children) {
      element.setAttribute('class', attributes)
    }
    else {
      element.innerHTML = attributes
    }
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

export function $list(items) {
  const ul = document.createElement('ul')
  items.forEach(function (item) {
    ul.appendChild($new('li', item))
  })
  return ul
}

export function $row(row) {
  const tr = document.createElement('tr')
  if (row._id) {
    tr.id = row._id
  }
  else {
    console.warn('_id not found', row)
  }
  each(row, function (value, key) {
    if ('_' != key[0]) {
      if (value instanceof Element) {
        tr.appendChild(value)
      }
      else if (isObject(value)) {
        tr.appendChild($new('td', value))
      }
      else {
        const td = document.createElement('td')
        td.innerHTML = value
        tr.appendChild(td)
      }
    }
  })
  return tr
}

export function $table(rows) {
  const table = document.createElement('table')
  rows.forEach(function (row) {
    table.appendChild($row(row))
  })
  return table
}

export function bar(events) {
  each(events, function (fn, id) {
    $id(id).addEventListener('click', fn)
  })
}

export function keydown(key, code) {
  if (!code) {
    code = key.charCodeAt(0)
  }
  this.dispatchEvent(new KeyboardEvent('keydown', {key, code: key, charCode: code, keyCode: code}))
}

export function keyup(key, code) {
  if (!code) {
    code = key.charCodeAt(0)
  }
  this.dispatchEvent(new KeyboardEvent('keyup', {key, code: key, charCode: code, keyCode: code}))
}

export function keypress(key, code) {
  if (!code) {
    code = key.charCodeAt(0)
  }
  this.dispatchEvent(new KeyboardEvent('keypress', {key, code: key, charCode: code, keyCode: code}))
}

// const _exports = {$$, $all, $id, $new, $list, $table, bar, keydown, keyup, keypress}
// extend(window, _exports);

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
    return this
  },

  detach() {
    this._parent = this.parentNode
    const nextSibling = this.nextSibling
    if (nextSibling) {
      this._nextSibling = nextSibling
    }
    this.remove()
    return this
  },

  add(tag, attrs, children) {
    this.appendChild($new(tag, attrs, children))
    return this
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
  },

  import() {
    return document.importNode(this, true).content
  },

  assign(vars) {
    each(vars, (value, selector) => this.querySelector(selector).innerHTML = value)
    return this
  },

  appropriate(attrs) {
    each(attrs, (value, key) => this.setAttribute(key, value))
    return this
  },

  create(vars) {
    const element = this.import()
    if (vars) {
      element.assign(vars)
    }
    return element
  },

  place(selector, vars) {
    const element = $$(selector).create(vars)
    this.detach()
    this.innerHTML = ''
    this.appendChild(element)
    this.attach()
    return this.children[0]
  },

  replace(element) {
    this.parentNode.insertBefore(element, this)
    this.remove()
    return element
  },

  $$(selector) {
    return this.querySelector(selector)
  },

  $all(selector) {
    return this.querySelectorAll(selector)
  },

  set(selector, value) {
    this.querySelector(selector, value)
    return this
  },

  fragment(array) {
    const fragment = document.createDocumentFragment()
    array.forEach(function (element) {
      fragment.appendChild(element)
    })
    this.appendChild(fragment)
    return this
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

extend(HTMLFormElement.prototype, Emitter.prototype, {
  init(events) {
    Emitter.call(this)
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

extend(HTMLTableElement.prototype, {
  update(objects) {
    objects.forEach(o => this.upsertRow(o))
  },

  upsertRow(object) {
    let tr = this.$$(`#${object.id}`)
    if (tr) {
      const keys = Object.keys(object)
      tr.$all('td').forEach(function (td, i) {
        const value = object[keys[i]]
        if (value instanceof Element) {
          td.innerHTML = ''
          td.appendChild(value)
        }
        else {
          td.innerHTML = value
        }
      })
    }
    else {
      this.appendChild($row(object))
    }
  }
})
