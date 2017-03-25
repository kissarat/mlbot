const merge = require('deepmerge')
const freeze = require('deep-freeze')

var local
try {
  local = require('../local')
}
catch (ex) {
}

const config = {
  dev: true,
  reset: false,
  origin: 'http://app.inbisoft.com',
  window: {
    minWidth: 960,
    minHeight: 680,
    width: 1024,
    height: 768,
    resizable: false
  },

  exclude: ['echo123', 'kissarat'],

  vendor: 'inbisoft',
  // vendor: 'club-leader',

  Status: {
    FORBIDDEN: -2,
    ABSENT: -1,

    NONE: 0,
    SELECTED: 1,
    SCHEDULED: 2,
    SUCCESS: 200,
    ACCEPTED: 202,

    // CREATED: 0
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

// module.exports = freeze(local ? merge(config, local) : config)
module.exports = config
