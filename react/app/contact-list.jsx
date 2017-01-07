import React, {Component} from 'react'
import {Link} from 'react-router'
import {Table, Checkbox, Button} from 'semantic-ui-react'
import {getCollection} from '../database'
import Skype from '../skype'
import {toArray} from 'lodash'

export default class ContactList extends Component {
  componentWillMount() {
    this.setState({
      contacts: toArray(getCollection('contact'))
    })
    Skype.all().forEach(skype => skype.on('profile.contacts',
      () => this.setState({contacts: getCollection('contact')})))
  }

  checkAll(value) {
    this.state.contacts.forEach(c => c.checked = value)
    this.setState({contacts: this.state.contacts})
  }

  check(id) {
    const contact = this.state.contacts.find(c => c.id === id)
    contact.checked = !contact.checked
    this.setState({contacts: this.state.contacts})
  }

  render() {
    const contacts = this.state.contacts.map(c => <Table.Row key={c.id}>
      <Table.Cell><Checkbox onChange={() => this.check(c.id)} checked={c.checked}/></Table.Cell>
      <Table.Cell>{c.login}</Table.Cell>
      <Table.Cell>{c.name}</Table.Cell>
      <Table.Cell>{c.account}</Table.Cell>
    </Table.Row>)

    return <div>
      <div>
        <Button onClick={() => this.checkAll(true)}>все</Button>
        <Button onClick={() => this.checkAll(false)}>никто</Button>
      </div>
      <Table compact>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell />
            <Table.HeaderCell>Логин</Table.HeaderCell>
            <Table.HeaderCell>Имья</Table.HeaderCell>
            <Table.HeaderCell>Аккаунт</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>{contacts}</Table.Body>
      </Table>
    </div>
  }
}
