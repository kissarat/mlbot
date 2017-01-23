import React, {Component} from 'react'
import {Message, Icon} from 'semantic-ui-react'
import {omit, pick} from 'lodash'
import HidableComponent from '../base/hidable-component.jsx'

export default class Alert extends HidableComponent {
  getStorageName() {
    return this.props.persist
  }

  componentWillReceiveProps(props) {
    const messageProps = omit(props,
      'children',
      'persist',
      'content'
    )
    messageProps['data-persist'] = props.persist
    messageProps.className = props.className ? props.className + ' alert visible' : 'alert visible'
    this.setState({messageProps})
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
    if (this.props.persist) {
      this.loadState()
    }
  }

  render() {
    return this.state.visible
      ? <Message {...this.messageProps}>
      <div className="alert-content">{this.props.content || this.props.children}</div>
      <Icon name="close" size="large" onClick={() => this.setState({visible: false})}/>
    </Message>
      : <div className="alert hidden"></div>
  }
}
