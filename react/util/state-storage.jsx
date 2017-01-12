import {defaults, pick, each} from 'lodash'

export class StateStorage {
  constructor() {
    this.stores = {}
  }

  register(name, props = false, state = {}) {
    this.stores[name] = {props, state: {}, defaults: state}
    return this.load(name, state)
  }

  load(name, defaultValues) {
    const store = this.stores[name]
    try {
      store.state = JSON.parse(localStorage.getItem(name))
    }
    catch (ex) {

    }
    defaults(store.state, defaultValues)
    return store.state
  }

  save(name, state) {
    const store = this.stores[name]
    store.state = state || store.state || {}
    store.state = store.props ? pick(store.state, store.props) : store.state
    localStorage.setItem(name, JSON.stringify(store.state))
    return store.state
  }

  saveAll() {
    each(this.stores, (state, name) => this.save(name))
  }

  unregister(name, state) {
    this.save(name, state)
    delete this.stores[name]
  }

  reset(name) {
    const store = this.stores[name]
    store.state = store.defaults || {}
    localStorage.removeItem(name)
    return store.state
  }
}

const stateStorage = new StateStorage()
window.stateStorage = stateStorage
export default stateStorage

addEventListener('beforeunload', () => stateStorage.saveAll())
