import {isObject} from 'lodash'

export const start = Date.now()

export function clear(data) {
  for(const key in data) {
    const value = data[key]
    if (null === value || undefined === value) {
      delete data[key]
    }
    else if ('object' === typeof value) {
      if (value instanceof Array) {
        value.forEach(function (item) {
          if (isObject(item)) {
            clear(item)
          }
        })
      }
      else {
        clear(value)
      }
    }
  }
  return data
}

function qq(promise) {
  return 'function' === typeof promise ? promise() : promise
}

export function seq(promises) {
  return promises.length > 1
    ? qq(promises[0]).then(() => seq(promises.slice(1)))
    : qq(promises[0])
}

export function parse(string, sep = '&', eq = '=') {
  const object = {}
  if (string) {
    string.split(sep).forEach(function (r) {
      r = r.split(eq)
      object[r[0]] = r[1]
    })
  }
  return object
}

export function stringify(object, sep = '&', eq = '=') {
  const strings = []
  for (var key in object) {
    strings.push(key + eq + object[key])
  }
  return strings.join(sep)
}

export function filterSkypeUsernames(value) {
  const array = 'string' === typeof value ? value.split(/\s*\n\s*/) : value
  const accounts = []
  array.forEach(function (string) {
    const match =
      /[^\s]+@[\w\-.]+.\w+/.exec(string) ||
      /([a-zA-Z]+):?[a-zA-Z0-9.,\-_]{5,31}/.exec(string)
    if (match) {
      const login = match[0]
      if ('facebook:'.indexOf(login) < 0) {
        accounts.push(login)
      }
    }
  })
  return accounts
}

export function setImmediate(fn) {
  return setTimeout(fn, 0)
}

export function wait(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

export function operationTimeout(cb) {
  if (skypeTimeout) {
    const timeoutSeconds = Math.round(skypeTimeout / 1000)
    return setTimeout(cb, skypeTimeout, {
      timeout: skypeTimeout,
      timeoutSeconds,
      message: `Прошло ${timeoutSeconds} секунд`
    })
  }
}

export function errorMessage(err) {
  return 'function' === typeof err.getMessage ? err.getMessage() : err.message
}
