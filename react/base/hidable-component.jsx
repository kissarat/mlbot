import React, {Component} from 'react'

export default class HidableComponent extends Component {
  persist = ['visible']
  state = {
    visible: true
  }
}
