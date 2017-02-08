import React, {PureComponent, PropTypes} from 'react'
import {Message} from 'semantic-ui-react'
import {omit, pick} from 'lodash'
import Persistence from '../util/persistence.jsx'

export default class Alert extends PureComponent {
  persist = ['hidden']

  static propTypes = {
    hidden: PropTypes.bool,
    persist: PropTypes.string,
    content: PropTypes.string,
  }

  getStorageName() {
    return this.props && this.props.persist
  }

  componentWillReceiveProps(props) {
    const messageProps = omit(props,
      'children',
      'persist',
      'hidden'
    )

    if (props.persist) {
      messageProps['data-persist'] = props.persist
    }
    this.setState(Persistence.register(this, {
      messageProps,
      hidden: false
    }))
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  onDismiss = () => {
    this.setState({hidden: true})
    setTimeout(() => this.save(), 0)
  }

  render() {
    return <Message
      onDismiss={this.onDismiss}
      hidden={this.state.hidden}
      {...this.state.messageProps}/>
  }
}
