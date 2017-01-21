import React, {Component} from 'react'
import {each, defaults, isObject, pick, merge} from 'lodash'

export default class SingletonComponent extends Component {
  componentWillMount() {
    if (isObject(this.constructor.state)) {
      this.setState(this.constructor.state)
      this.constructor.state = false
    }
    this.constructor.instance = this
  }

  componentWillUnmount() {
    this.state = this.constructor.instance
    this.constructor.instance = false
  }

  static one() {
    if (!this.instance) {
      console.warn(`${this.constructor.prototype} singleton does not exists`)
    }
    return this.instance
  }

  static getState() {
    return this.instance ? this.instance.state : this.state
  }

  static get(propNames) {
    return pick(this.getState(), propNames)
  }

  static set(state) {
    return this.instance ? this.instance.setState(state) : merge(this.state, state)
  }
}
