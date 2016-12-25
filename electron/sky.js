const {EventEmitter} = require('events')
const {extend} = require('lodash')

const promises = {}

module.exports = {
  mid: 0,
  rid: 0,
  promises
}

module.exports.reply = function (data) {
  const promise = promises[data.rid]
  if (promise instanceof Function) {
    promise(data)
    delete data.rid
  }
  else {
    console.error(`Promise ${data.rid} not found`, data)
  }
}

module.exports.request = function (inData) {
  inData.rid = ++module.exports.rid
  return new Promise(function (resolve, reject) {
    promises[inData.rid] = function (outData) {
      if (outData.error) {
        reject(outData)
      }
      else  {
        resolve(outData)
      }
    }
  })
}

extend(module.exports, EventEmitter.prototype)
EventEmitter.call(module.exports)

global.sky = module.exports
