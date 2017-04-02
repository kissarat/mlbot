const freeze = require('deep-freeze')
const merge = require('deepmerge')
const package_json = require('./package.json')
const {cloneDeep} = require('lodash')

var local
try {
  local = require('../local')
}
catch (ex) {
}

let config = {
  dev: true,
  reset: false,
  origin: 'https://app.inbisoft.com',
  window: {
    minWidth: 960,
    minHeight: 680,
    width: 1024,
    height: 768,
    // resizable: false
  },

  exclude: ['echo123', 'kissarat'],

  vendor: 'inbisoft',
  // vendor: 'club-leader',

  request: {
    type: 'fetch'
  },

  account: {
    timeout: 180000,
    min: 0,
    max: 0,
    server: 0,
    max_invite: 40,
    desktop: false,
    web: false,
    expires: 3 * 3600 * 1000 
  },

  Status: {
    FORBIDDEN: -403,
    ABSENT: -404,
    ERROR: -500,

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

  task: {
    enabled: false,
    interval: 5000,
    delay: 5000
  },

  start: {
    delay: 3000
  },

  invite: {
    timeout: 7000,
    interval: 2000
  }
}

if ('undefined' !== typeof localStorage) {
  config[Symbol.for('default')] = cloneDeep(config)
  try {
    const string = localStorage.getItem('config')
    if (string) {
      const _config = JSON.parse(string)
      config.version = package_json.version
      if (config.version === _config.version) {
        config = merge(config, _config)
      }
      localStorage.removeItem('config')
    }
    else {
      console.warn('Local configuration not found')
    }
  }
  catch (ex) {
    console.warn('Local configuration not loaded', ex)
  }
}

// module.exports = freeze(local ? merge(config, local) : config)
module.exports = config
