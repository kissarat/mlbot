const {EventEmitter} = require('events')
const {extend} = require('lodash')

module.exports = {
  mid: 0
}

extend(module.exports, EventEmitter.prototype)
EventEmitter.call(module.exports)

global.sky = module.exports
