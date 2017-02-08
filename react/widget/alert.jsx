import React, {PureComponent, PropTypes} from 'react'
import {Message} from 'semantic-ui-react'
import {omit, pick} from 'lodash'
import Persistence from '../util/persistence.jsx'

export default class Alert extends PureComponent {
  static propTypes = {
    hidden: PropTypes.bool,
    persist: PropTypes.string,
    content: PropTypes.string,
  }

  constructor() {
    super()
    this.state = Persistence.register(this, {
      hidden: false
    })
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
    this.setState({messageProps})
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  onDismiss = () => {
    this.setState({hidden: true})
  }

  render() {
    return <Message
      onDismiss={this.onDismiss}
      hidden={this.props.hidden || this.state.hidden}
      {...this.state.messageProps}/>
  }
}
