import {isObject} from 'lodash'

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
