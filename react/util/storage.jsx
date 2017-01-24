import {defaults, pick, each} from 'lodash'

const Persistence = {
  getStorageName() {
    return this.constructor.name
  },

  load(defaultValues) {
    const raw = localStorage.getItem(this.getStorageName())
    try {
      return defaults(JSON.parse(raw), defaultValues)
    }
    catch (ex) {
      return defaultValues
    }
  },

  save(state) {
    localStorage.setItem(this.getStorageName(), pick(JSON.stringify(state || this.state), this.persist))
  },

  componentWillUnmount() {
    this.unregister()
  }
}

const Registry = {}

Persistence.register = function (target, defaultValues) {
  defaults(target, Persistence)
  Registry[this.getStorageName()] = this
  return this.load(defaultValues)
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
