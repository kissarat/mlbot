import React, {Component, PropTypes} from 'react'
import {Button} from 'semantic-ui-react'
import {Status} from '../../app/config'
import {toArray, defaults, keyBy, uniq} from 'lodash'
import Contact from '../entity/contact.jsx'
import ContactList from '../widget/contact-list.jsx'
import db from '../database.jsx'

export default class DeliveryList extends Component {
  static propTypes = {
    authorized: React.PropTypes.oneOf([0, 1]).isRequired,
    status: React.PropTypes.oneOf([Status.CREATED, Status.SELECTED]).isRequired,
    account: PropTypes.string,
    sort: PropTypes.string,
  }

  state = {
    busy: false
  }

  changeStatusAll = async() => {
    this.setState({busy: true})
    await db.contact.where({
      account: this.props.account,
      status: this.props.selected ? Status.SELECTED : Status.CREATED,
      authorized: 1
    })
      .update({account: this.props.account},
        {status: this.props.selected ? Status.CREATED : Status.SELECTED}
      )
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

  render() {
    return <ContactList
      {...this.props}
      className={this.className()}>
      {this.button()}
    </ContactList>
  }
}
