import React, {Component} from 'react'
import stateStorage from './state-storage.jsx'
import {toArray, isObject, merge, debounce, defaults, pick} from 'lodash'
import {setImmediate} from './index.jsx'

const Persistent = {
  getStorageName() {
    return this.constructor.name
  },

  loadState(defaultProps) {
    /*
    let state = stateStorage.register(this.getStorageName(), this.persistentProps, this.state)
    if (isObject(defaultProps)) {
      state = merge(state, defaultProps)
    }
    this.setState(state)
    if (this.initialize instanceof Function) {
      setImmediate(() => this.initialize())
    }
    */
  },

  unregisterStorage(state) {
    // stateStorage.unregister(this.getStorageName(), state || this.state)
  },

  updateStorage(state) {
    // stateStorage.update(this.getStorageName(), state || this.state)
  },

  saveStorage(state) {
    // stateStorage.save(this.getStorageName(), state || this.state)
  },

  componentWillMount() {
    this.loadState()
  },

  componentWillReceiveProps() {
    this.loadState()
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

export default Persistent
