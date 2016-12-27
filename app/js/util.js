const {isObject} = require('lodash')

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

module.exports = {clear}
