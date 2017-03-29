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

  desktop: {
    loadChatList: true
  },

  exclude: ['echo123', 'kissarat'],

  vendor: 'inbisoft',
  // vendor: 'club-leader',

  account: {
    timeout: 180000,
    min: 0,
    max: 0,
    server: 0,
    desktop: false,
    web: false
  },

  Status: {
    FORBIDDEN: -403,
    ABSENT: -404,

    NONE: 0,
    SELECTED: 1,
    SCHEDULED: 2,
    ACCEPTED: 3,
    DONE: 4,
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
