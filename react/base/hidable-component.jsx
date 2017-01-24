import React, {Component} from 'react'
import Persistent from '../util/persistent.jsx'

export default class HidableComponent extends Component {
  persist = ['visible']
  state = {
    visible: true
  }
  componentWillMount() {
    if (this.props.persist) {
      Persistent.setup(this, this.props)
    }
  }
}
