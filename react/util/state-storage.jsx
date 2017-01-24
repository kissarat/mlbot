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
    console.log('StateStorage.update', name, this.stores[name], state)
    return this.stores[name].state = state
  }

  _save(store) {
    const state = store.props ? pick(store.state, store.props) : store.state
    localStorage.setItem(name, JSON.stringify(state))
  }

  save(name, state) {
    // console.log('StateStorage.save', name, state)
    this.update(name, state)
    this._save(this.stores[name])
  }

  saveAll() {
    // console.log('StateStorage.saveAll')
    each(this.stores, this._save)
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
export default stateStorage

addEventListener('beforeunload', () => stateStorage.saveAll())
