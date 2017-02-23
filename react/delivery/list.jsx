import React, {Component, PropTypes} from 'react'
import {Button} from 'semantic-ui-react'
import {Status, Type} from '../../app/config'
import {toArray, defaults, keyBy, uniq, values} from 'lodash'
import Contact from '../entity/contact.jsx'
import ContactList from '../widget/contact-list.jsx'
import db from '../database.jsx'

export default class DeliveryList extends Component {
  static propTypes = {
    type: PropTypes.oneOf(values(Type)).isRequired,
    account: PropTypes.string,
    authorized: PropTypes.oneOf([0, 1]).isRequired,
    disabled: PropTypes.bool,
    sort: PropTypes.string,
    status: PropTypes.oneOf([Status.CREATED, Status.SELECTED]).isRequired,
  }

  state = {
    busy: false
  }

  changeStatusAll = async() => {
    if (this.props.account) {
      this.setState({busy: true})
      const where = {
        account: this.props.account,
        status: this.props.status,
        authorized: 1
      }
      const mods = {
        status: Status.CREATED === this.props.status ? Status.SELECTED : Status.CREATED
      }
      // console.log(where, mods)
      await db.contact.where(where).modify(mods)
      Contact.emit('update')
      this.setState({busy: false})
    }
  }

  className() {
    let className = (this.props.className || '') + ' delivery-list '
    className += this.props.status ? 'selected' : 'other'
    return className
  }

  button() {
    return <Button
      disabled={!this.props.account}
      loading={this.state.busy}
      type="button"
      onClick={this.changeStatusAll}
      content={Status.SELECTED === this.props.status ? 'Никому' : 'Разослать всем'}
      title="Кому отправить сообщение?"/>
  }

  render() {
    return <ContactList
      {...this.props}
      disabled={!this.props.account}
      className={this.className()}>
      {this.button()}
    </ContactList>
  }
}
