var merge = require('deepmerge')
var package_json = require('./package.json')
var _ = require('lodash')

var vendor = 'inbisoft'
// var vendor = 'club-leader'
// var vendor = 'lsproject'

var config = {
  dev: false,
  reset: false,
  origin: 'lsproject' === vendor ? 'https://ls.inbisoft.com' : 'https://app.inbisoft.com',
  window: {
    minWidth: 960,
    minHeight: 680,
    width: 1024,
    height: 768,
    // resizable: false
  },

  exclude: ['echo123', 'kissarat'],

  vendor,

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
    CONFLICT: -409,
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
  config[Symbol.for('default')] = _.cloneDeep(config)
  try {
    var string = localStorage.getItem('config')
    if (string) {
      var _config = JSON.parse(string)
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

var local
try {
  if ('undefined' !== typeof process && process.env && 'dev' === process.env.MLBOT) {
    local = require('../local')
    config = merge(config, local)
  }
}
catch (ex) {
}

module.exports = config
