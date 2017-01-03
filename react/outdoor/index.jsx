import React, {Component} from 'react'

export default class Outdoor extends Component {
  render() {
    return <div className="layout outdoor">{this.props.children}</div>
  }
}
