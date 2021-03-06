import config from '../app/config'
import {merge, defaults, pick, each, isObject, omit} from 'lodash'

const Persistence = {
  getStorageName() {
    return this.name
  },

  load(defaultValues) {
    const name = this.getStorageName()
    if (name) {
      const raw = localStorage.getItem(this.getStorageName())
      try {
        const state = JSON.parse(raw)
        defaults(state, defaultValues)
        return state || {}
      }
      catch (ex) {
      }
      return defaultValues || {}
    }
    else {
      console.error('Unnamed Component', this.constructor.name, defaultValues)
      return defaultValues
    }
  },

  save(state) {
    state = pick(state || this.state, this.persist)
    const name = this.getStorageName()
    if (name) {
      localStorage.setItem(name, JSON.stringify(state))
    }
  },

  componentWillUnmount() {
    this.unregister()
  }
}

const Registry = {}

Persistence.register = function (target, defaultValues) {
  defaults(target, Persistence)
  Registry[target.getStorageName()] = target
  return target.load(defaultValues)
}

Persistence.unregister = function (state) {
  this.save(state)
  delete Registry[this.getStorageName()]
}

addEventListener('beforeunload', function () {
  each(Registry, s => s.save())
  if (!config.reset) {
    localStorage.setItem('config', JSON.stringify(omit(config,
      'window', 'vendor', 'Status', 'Type', '')))
  }
})

export default Persistence
export {Registry}
