const merge = require('deepmerge')
const freeze = require('deep-freeze')

var local
try {
  local = require('../local')
}
catch (ex) {
}

const config = {
  dev: false,
  reset: false,
  origin: 'http://app.inbisoft.com',
  window: {
    minWidth: 960,
    minHeight: 768,
    width: 1080,
    height: 960,
    x: 0
  },

  Status: {
    FORBIDDEN: -2,
    ABSENT: -1,

    CREATED: 0,
    SELECTED: 1,
    PROCESSING: 2,
    INVITED: 3,
    SENT: 4,
    DOUBLE: 5,
  },

  Type: {
    PERSON: 0,
    CHAT: 1,
  },

  start: {
    delay: 3000
  },
  invite: {
    timeout: 7000,
    interval: 2000
  }
}

module.exports = freeze(local ? merge(config, local) : config)
