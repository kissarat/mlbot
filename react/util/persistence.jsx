import {merge, defaults, pick, each, isObject} from 'lodash'

const Persistence = {
  getStorageName() {
    return this.constructor.name
  },

  load(defaultValues) {
    const raw = localStorage.getItem(this.getStorageName())
    try {
      const state = JSON.parse(raw)
      defaults(state, defaultValues)
      return state || {}
    }
    catch (ex) {
    }
    return defaultValues || {}
  },

  save(state) {
    state = pick(state || this.state, this.persist)
    localStorage.setItem(this.getStorageName(), JSON.stringify(state))
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
})

export default Persistence
export {Registry}
