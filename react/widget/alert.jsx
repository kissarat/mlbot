import React, {Component} from 'react'
import {Message, Icon} from 'semantic-ui-react'
import {omit} from 'lodash'
import PersistentComponent from '../base/persistent-component.jsx'

export default class Alert extends PersistentComponent {
  state = {
    visible: true
  }
  
  componentWillReceiveProps(props) {

  }

  render() {
    const props = omit(this.props,
      'children',
    )
    props.className = props.className ? props.className + ' alert' : 'alert'
    return <Message {...props}>
      <div className="alert-content">{this.props.children}</div>
      <Icon name="close"/>
    </Message>
  }
}
