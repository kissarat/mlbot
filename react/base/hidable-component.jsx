import React, {Component} from 'react'
import Persistence from '../util/persistence.jsx'

export default class HidableComponent extends Component {
  persist = ['visible']

  constructor() {
    super()
  }

  componentWillMount() {
    this.setState(Persistence.register(this, {
      visible: true
    }))
  }
}
