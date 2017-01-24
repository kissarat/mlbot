import React, {Component} from 'react'
import {Button} from 'semantic-ui-react'
import {Status} from '../../app/config'
import {toArray, defaults, keyBy, uniq} from 'lodash'
import Contact from '../entity/contact.jsx'
import ContactList from '../widget/contact-list.jsx'

export default class InviteList extends Component {
  state = {
    busy: false
  }

  removeAll = async() => {
    this.setState({busy: true})
    await Contact.queue().delete()
    Contact.emit('update')
    this.setState({busy: false})
  }

  render() {
    if (this.props.account) {

    }
    return <ContactList
      condition={Contact.queries.queue}
      sort="time">
      <Button
        loading={this.state.busy}
        type="button"
        className="remove-all"
        onClick={this.removeAll}
        icon="trash"
        content="Очистить"/>
    </ContactList>
  }
}
