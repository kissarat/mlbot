import {defaults, pick, each} from 'lodash'
// import

function _load(name) {
  const raw = localStorage.getItem(name)
  if (raw) {
    try {
      return JSON.parse(raw)
    }
    catch (ex) {

    }
  }
}

function _save(name, state) {
  localStorage.setItem(name, JSON.stringify(state))
}

export class StateStorage {
  constructor() {
    this.stores = {}
  }

  register(name, initial) {
    console.log('StateStorage.register', name)
    const stored = _load(name)
    return this.stores[name] = defaults(initial, stored)
  }


  update(name, state) {
    console.log('StateStorage.update', name, this.stores[name], state)
    return this.stores[name] = state
  }

  save(name, state) {
    console.log('StateStorage.save', name, state)
    this.stores[name] = state
    _save(name, this.stores[name])
  }

  saveAll() {
    // console.log('StateStorage.saveAll')
    each(this.stores, (state, name) => _save(name, state))
  }

  unregister(name, state) {
    delete this.stores[name]
    save(name, state)
  }
}

const stateStorage = new StateStorage()
export default stateStorage

addEventListener('beforeunload', () => stateStorage.saveAll())
