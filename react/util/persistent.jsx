import React, {Component} from 'react'
import stateStorage from './state-storage.jsx'
import {toArray, isObject, merge} from 'lodash'
import {setImmediate} from './index.jsx'

const Persistent = {
  getStorageName() {
    return this.constructor.name
  },

  loadState(defaultProps) {
    let state = stateStorage.register(this.getStorageName(), this.persistentProps, this.state)
    if (isObject(defaultProps)) {
      state = merge(state, defaultProps)
    }
    this.setState(state)
    if (this.initialize instanceof Function) {
      setImmediate(() => this.initialize())
    }
  },

  componentWillMount() {
    this.loadState()
  },

  componentWillReceiveProps() {
    this.loadState()
  },

  unregisterStorage(state) {
    stateStorage.unregister(this.getStorageName(), state || this.state)
  },

  saveStorage(state) {
    stateStorage.save(this.getStorageName(), state || this.state)
  },

  componentWillUnmount() {
    this.unregisterStorage()
  },

  componentDidUpdate() {
    this.saveStorage()
  }
}

export default Persistent
