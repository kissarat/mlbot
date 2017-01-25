import React, {PropTypes} from 'react'
import {Message, Icon} from 'semantic-ui-react'
import {omit, pick} from 'lodash'
import HidableComponent from '../base/hidable-component.jsx'

export default class Alert extends HidableComponent {
  static propTypes = {
    visible: PropTypes.bool,
    persist: PropTypes.string,
    content: PropTypes.string,
  }

  getStorageName() {
    return this.props.persist
  }

  componentWillReceiveProps(props) {
    const messageProps = omit(props,
      'children',
      'persist',
      'content',
      'visible'
    )

    if (props.persist) {
      messageProps['data-persist'] = props.persist
      // this.loadState()
    }
    messageProps.className = props.className ? props.className + ' alert visible' : 'alert visible'
    if (this.state.visible && !props.visible) {
      this.setState({visible: false})
    }
    this.setState({messageProps})
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
