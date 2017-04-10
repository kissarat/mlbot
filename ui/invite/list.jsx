import Contact from '../../store/contact.jsx'
import ContactList from '../widget/contact-list.jsx'
import db from '../../store/database.jsx'
import React, {Component} from 'react'
import {Button} from 'semantic-ui-react'
import {Status} from '../../app/config'
import {toArray, defaults, keyBy, uniq, pick} from 'lodash'

export default class InviteList extends Component {
  state = {
    busy: false
  }

  removeAll = async() => {
    this.setState({busy: true})
    await db.contact.where({
      status: Status.SELECTED,
      authorized: 0
    })
      .delete()
    Contact.emit('update')
    this.setState({busy: false})
  }

  render() {
    if (this.props.account) {

    }
    return <ContactList
      authorized={0}
      status={Status.SELECTED}>
      <Button
        loading={this.state.busy}
        {...this.props}
        type="button"
        className="remove-all"
        onClick={this.removeAll}
        icon="trash"
        content="Очистить"/>
    </ContactList>
  }
}
