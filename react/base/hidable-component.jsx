import React, {Component} from 'react'
import Persistent from '../util/persistent.jsx'
import {mix} from '../util/index.jsx'

export default class HidableComponent extends Component {
  constructor() {
    super()
    mix(this,
      Persistent,
    )
  }

  persistentProps = ['visible']
  state = {
    visible: true
  }
}
