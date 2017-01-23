import {defaults, pick, each} from 'lodash'

export class StateStorage {
  constructor() {
    this.stores = {}
  }

  register(name, props = false, state = {}) {
    // console.log('StateStorage.register', name, state)
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

  update(name, state) {
    // console.log('StateStorage.update', name, state)
    return this.stores[name].state = state
  }

  save(name, state) {
    // console.log('StateStorage.save', name, state)
    const store = this.stores[name]
    this.update(name, state)
    localStorage.setItem(name, JSON.stringify(store.props ? pick(store.state, store.props) : store.state))
  }

  saveAll() {
    // console.log('StateStorage.saveAll')
    each(this.stores, (state, name) => this.save(name))
  }

  unregister(name, state) {
    if (this.stores[name]) {
      this.save(name, state)
      delete this.stores[name]
    }
  }

  reset(name) {
    // console.log('StateStorage.reset', name)
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
