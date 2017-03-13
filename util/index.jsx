import os from 'os'
import {Type} from '../app/config'
import {isObject, omit, defaults, slice, uniq, each, pick} from 'lodash'

export const start = new Date()

export function clear(data) {
  for (const key in data) {
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

export function isSkypeUsername(string) {
  return string && !/^(\+?\d+|facebook:|guest:)/.test(string)
}

export function filterSkypeUsernames(value) {
  const array = 'string' === typeof value ? value.split(/\s*\n\s*/) : value
  const usernames = []
  array.forEach(function (string) {
    string = string.trim()
    if (isSkypeUsername(string)) {
      usernames.push(string)
    }
    else {
      // console.warn(string)
    }
  })
  return usernames
}

export function setImmediate(fn) {
  return setTimeout(fn, 0)
}

export function wait(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

export function operationTimeout(cb) {
  if (skypeTimeout) {
    const timeoutSeconds = Math.round(skypeTimeout / 1000)
    return setTimeout(cb, skypeTimeout, {
      timeout: skypeTimeout,
      timeoutSeconds,
      message: `Прошло ${timeoutSeconds} секунд`
    })
  }
}

export function errorMessage(err) {
  return 'function' === typeof err.getMessage ? err.getMessage() : err.message
}

export function mixer(source) {
  return function mix(target) {
    target[source.constructor.name] = source
    if (!isObject(target.mixins)) {
      target.mixins = {}
    }
    target.mixins[source.constructor.name] = source
    // console.log(`${target.constructor.name} injected ${source.constructor.name}`)
    // window[target.constructor.name] = target
    return defaults(target, omit(source, 'mix'))
  }
}

export function mix(target) {
  // target.mixins = (target.mixins || []).concat(slice(arguments, 1))
  return defaults.apply(null, arguments)
}

export function createTokenInfo() {
  const expires = new Date(start.getTime())
  expires.setMonth(expires.getMonth() + 6)

  const data = {type: 'app', expires: expires.toISOString()}
  const network = {}

  each(pick(os.networkInterfaces(), 'en0', 'eth0'), function (value, key) {
    network[key] = value[0].mac
  })

  const userInfo = os.userInfo()

  data.hard = {
    platform: os.platform(),
    userInfo: pick(userInfo, 'username', 'homedir'),
    cpus: os.cpus().map(({model}) => model),
    network
  }

  data.soft = {
    screen: pick(screen, 'width', 'height', 'colorDepth'),
    platform: process.platform,
    release: os.release(),
    hostname: os.hostname(),
    totalmem: os.totalmem(),
    userInfo,
    cwd: process.cwd(),
    env: process.env
  }
  return data
}

export function* millisecondsId(max = 1000000) {
  const now = Date.now()
  let i = 0
  while (i < max) {
    yield now + i++
  }
}

export function getMri(contact) {
  return Type.CHAT === contact.type
    ? `19:${contact.login}@thread.skype`
    : '8:' + contact.login
}
