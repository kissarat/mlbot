import React, {Component} from 'react'
import Persistent from '../util/persistent.jsx'

export default class HidableComponent extends Component {
  constructor() {
    super()
    Persistent.mix(this)
  }

  persistentProps = ['visible']
  state = {
    visible: true
  }
}
