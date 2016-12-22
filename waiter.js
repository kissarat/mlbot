function $$(selector) {
  return document.querySelector(selector)
}

function $all(selector) {
  return document.querySelectorAll(selector)
}

['map', 'forEach'].forEach(function (fn) {
  Element.prototype[fn] = Array.prototype[fn]
})

function waiter(selectors, cb) {
  const found = {}
  const url = location.pathname + location.search

  function loop() {
    if (selectors instanceof Object) {
      for (var key in selectors) {
        const condition = selectors[key]
        var result
        if ('string' === typeof condition) {
          result = $$(condition)
        }
        else if ('function' === typeof condition) {
          result = condition(found)
        }
        else if (condition instanceof RegExp) {
          result = condition.exec(url)
        }
        else {
          console.error('Invalid condition', condition)
        }
        if (result) {
          found[key] = result
        }
        else {
          return setTimeout(loop, 500)
        }
      }
      if (cb instanceof Function) {
        cb(found)
      }
    }
    else if ('string' === typeof selectors) {
      const result = $$(selectors)
      if (result) {
        cb(result)
      }
      else {
        setTimeout(loop, 500)
      }
    }
    else {
      console.warn('Invalid callback in waiter')
    }
  }

  setTimeout(loop, 0)
}

waiter.form = function (fields, selectors, cb) {
  selectors = selectors || {}
  for (var selector in fields) {
    selectors[selector] = selector
  }
  waiter(selectors, function (o) {
    for (var selector in fields) {
      const v = fields[selector]
      o[selector].value = v instanceof Function ? v() : v
    }
    if (cb instanceof Function) {
      cb(o)
    }
    else {
      console.warn('No callback in waiter.form')
    }
  })
}

waiter.fill = function (prefix, values, selectors, cb) {
  const fields = {}
  for (var key in values) {
    fields[(prefix || '') + '[name="' + key + '"]'] = values[key]
  }
  waiter.form(fields, selectors, cb)
}

waiter.pull = function (name, initial) {
  var stored = localStorage.getItem(name)
  if (stored) {
    stored = JSON.parse(stored)
  }
  else {
    stored = initial instanceof Function ? initial(name) : initial
  }
  if (stored.length > 0) {
    const result = stored[0]
    localStorage.setItem(name, JSON.stringify(stored.slice(1)))
    return result
  }
}

waiter.scripts = {
  jQuery: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js',
  lodash: 'https://cdn.rawgit.com/lodash/lodash/4.16.6/dist/lodash.min.js',
  underscore: 'https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js'
}

waiter.require = function (scripts, cb) {
  if ('string' === typeof scripts) {
    scripts = [scripts]
  }
  cb = cb || function () {
      console.warn('No callback in waiter.script')
    }
  var i = scripts.length
  scripts.forEach(function (src) {
    if (src in waiter.scripts) {
      src = waiter.scripts[src]
    }
    var script = document.querySelector('[src="' + src + '"]')
    if (script) {
      i--
    }
    else {
      script = document.createElement('script')
      script.addEventListener('load', function () {
        i--
        if (i <= 0) {
          cb()
        }
      })
      script.src = src
      document.body.appendChild(script)
    }
  })
  if (i <= 0) {
    cb()
  }
}

waiter.extract = function (selector) {
  const object = {};
  [].forEach.call(document.querySelectorAll(selector), function (input) {
    const name = input.getAttribute('name')
    let value = object[name]
    if (value instanceof Array) {
      object[name].push(input.value)
    }
    else if (value) {
      object[name] = [value, input.value]
    }
    else {
      object[name] = input.value
    }
  })
  return object
}

window.keydown = Element.prototype.keydown = function keydown(key, code) {
  this.dispatchEvent(new KeyboardEvent('keydown', {key, code: key, charCode: code, keyCode: code}))
}

window.keyup = Element.prototype.keyup = function keyup(key, code) {
  this.dispatchEvent(new KeyboardEvent('keyup', {key, code: key, charCode: code, keyCode: code}))
}

window.keypress = Element.prototype.keypress = function keypress(key, code) {
  this.dispatchEvent(new KeyboardEvent('keypress', {key, code: key, charCode: code, keyCode: code}))
}

Element.prototype.click = function keypress(key, code) {
  this.dispatchEvent(new MouseEvent('click'))
}

if (this.modules && modules.exports) {
  modules.exports = waiter
}

function addFriend(loginName) {
  waiter('[role=search]', function (input) {
    input.focus()
    input.value = loginName
    input.keypress('Enter', 13)
    waiter('.searchDictionary', function (button) {
      button.click()
      waiter('.directory li:nth-child(2)', function (li) {
        li.click()
        waiter('.contactRequestSend', function (requestButton) {
          requestButton.click()
        })
      })
    })
  })
}

function login(loginName, password) {
  waiter({
    form: '#i0281',
    email: '[type=email]'
  }, function ({form, email}) {
    email.value = loginName
    form.submit()
  })
  waiter({
    form: '#i0281',
    password: '[type=password]',
    remember: '[name=KMSI]'
  }, function ({form, password, remember}) {
    password.value = ''
    password.value = password
    remember.checked = true
    form.submit()
  })
}

function logout() {
  waiter('.Me-sky', function (button) {
    button.click()
    waiter('.Me-linkText', function (button) {
      button.click()
    })
  })
}

