import React, {Component} from 'react'
import stateStorage from './state-storage.jsx'
import {toArray, isObject, merge, debounce, defaults, pick} from 'lodash'
import {setImmediate} from './index.jsx'

const Persistent = {
  getStorageName() {
    return this.constructor.name
  },

  registerStorage(initial) {
    if (this.initialize instanceof Function) {
      console.warn('initialize', this.getStorageName())
    }
    return stateStorage.register(this.getStorageName(), initial)
  },

  unregisterStorage(state) {
    stateStorage.unregister(this.getStorageName(), state || this.state)
  },

  updateStorage(state) {
    stateStorage.update(this.getStorageName(), state || this.state)
  },

  saveStorage(state) {
    stateStorage.save(this.getStorageName(), state || this.state)
  },

  componentWillMount() {
    this.registerStorage()
  },

  componentWillUnmount() {
    this.unregisterStorage()
  },

  componentDidUpdate() {
    this.updateStorage()
  }
}

Persistent.mix = function(target) {
    defaults(target, Persistent)
  // defaults(target, pick(Persistent, 'getStorageName',
  //   'loadState', 'unregisterStorage', 'updateStorage',
  //   'componentWillUnmount'))
}

Persistent.setup = function (target, defaultValues) {
  if (!target.registerStorage) {
    Persistent.mix(target)
  }
  return target.registerStorage(defaultValues)
}

export default Persistent
