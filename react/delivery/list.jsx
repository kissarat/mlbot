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
    await Contact.selectAll(this.props.account, !this.props.selected)
    Contact.emit('update')
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

  condition() {
    return this.props.account
      ? Contact.selectedQuery(this.props.account, this.props.selected)
      : false
  }

  render() {
    return <ContactList
      className={this.className()}
      condition={this.condition()}>
      {this.button()}
    </ContactList>
  }
}
