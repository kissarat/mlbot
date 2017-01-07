const {isObject} = require('lodash')
const {parse, stringify} = require('./urlencoded')

function clear(data) {
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

function seq(promises) {
  return promises.length > 1
    ? qq(promises[0]).then(() => seq(promises.slice(1)))
    : qq(promises[0])
}

module.exports = {
  clear,
  seq,
  parse,
  stringify
}
