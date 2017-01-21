import React, {Component} from 'react'
import {Message, Icon} from 'semantic-ui-react'
import {omit, pick} from 'lodash'
import HidableComponent from '../base/hidable-component.jsx'

export default class Alert extends HidableComponent {
  getStorageName() {
    return this.props.persist
  }

  componentWillReceiveProps(props) {
    this.unregisterStorage()
    if (props.persist) {
      this.loadState()
    }
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  render() {
    const props = omit(this.props,
      'children',
      'persist',
    )
    props.className = props.className ? props.className + ' alert visible' : 'alert visible'
    return this.state.visible
      ? <Message {...props}>
      <div className="alert-content">{this.props.children}</div>
      <Icon name="close" onClick={() => this.setState({visible: false})}/>
    </Message>
      : <div className="alert hidden"></div>
  }
}
