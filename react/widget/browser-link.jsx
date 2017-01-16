import React, {Component} from 'react'
import {shell} from 'electron'

export default class BrowserLink extends Component {
  openUrl = e => {
    e.preventDefault()
    shell.openExternal(e.target.href)
  }

  render() {
    return <a className="widget browser-link" href={this.props.href} onClick={this.openUrl}>{this.props.children}</a>
  }
}
