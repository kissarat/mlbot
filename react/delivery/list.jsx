import React, {Component, PropTypes} from 'react'
import {Button} from 'semantic-ui-react'
import {Status} from '../../app/config'
import {toArray, defaults, keyBy, uniq} from 'lodash'
import Contact from '../entity/contact.jsx'
import ContactList from '../widget/contact-list.jsx'

export default class DeliveryList extends Component {
  static propTypes = {
    account: PropTypes.string,
    selected: PropTypes.bool.isRequired,
  }

  state = {
    busy: false
  }

  changeStatusAll = async() => {
    this.setState({busy: true})
    await Contact
      .queries[this.props.selected ? 'otherPage' : 'selectedPage']
      .update({account: this.props.account},
        {status: this.props.selected ? Status.CREATED : Status.SELECTED}
      )
    this.setState({busy: false})
  }

  className() {
    let className = (this.props.className || '') + ' delivery-list '
    className += this.props.selected ? 'selected' : 'other'
    return className
  }

  button() {
    return <Button
      disabled={!this.props.account}
      loading={this.state.busy}
      type="button"
      onClick={this.changeStatusAll}
      content={this.props.selected ? 'Никому' : 'Разослать всем'}
      title="Кому отправить сообщение?"/>
  }

  render() {
    return <ContactList
      account={this.props.account}
      className={this.className()}
      query={this.props.query}>
      {this.button()}
    </ContactList>
  }
}
