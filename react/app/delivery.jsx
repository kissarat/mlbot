import React, {Component} from 'react'
import {Form, Table, Checkbox, Button, List} from 'semantic-ui-react'
import Skype from '../skype/index.jsx'
import {toArray} from 'lodash'
import db from '../database.jsx'

export class ContactList extends Component {
  render() {
    const list = this.props.list.map(c => {
      let name = c.login
      if (name !== c.name) {
        name += ` (${c.name})`
      }
      return <Table.Row key={c.id} onClick={() => this.props.select(c)}>
        <Table.Cell>{name}</Table.Cell>
        <Table.Cell>{c.account}</Table.Cell>
      </Table.Row>
    })

    return <Table compact celled striped selectable>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Контакт</Table.HeaderCell>
          <Table.HeaderCell>Аккаунт</Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>{list}</Table.Body>
    </Table>
  }
}

export default class Delivery extends Component {
  state = {
    contacts: [],
    selections: []
  }

  componentWillMount() {
    this.loadContacts()
    Skype.on('profile.contacts', this.loadContacts)
  }

  componentWillUnmount() {
    Skype.off('profile.contacts', this.loadContacts)
  }

  loadContacts = () => {
    return db.contact.orderBy(':id').limit(100).toArray()
      .then((contacts) => {
        this.setState({contacts})
        Skype.on('message', this.send)
      })
      .catch(function (err) {
        console.error(err)
      })
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

  getChecked() {
    return this.state.contacts.filter(c => c.checked)
  }

  onSend = (e, {formData}) => {
    e.preventDefault()
    this.setState({text: formData.text})
    setTimeout(this.send, 0)
  }

  send = (a, b, c) => {
    console.log(a, b, c)
    const contact = this.state.contacts.find(c => c.checked)
    if (contact) {
      const message = {
        login: contact.login,
        text: this.state.text
      }
      console.log(contact, message)
      const skype = Skype.open({login: contact.account})
      skype.sendMessage(message)
    }
    else {
      console.log('Messages sent!')
    }
  }

  select(contact, remove) {
    const _from = remove ? 'selections' : 'contacts'
    const _to = remove ? 'contacts' : 'selections'
    this.setState({
      [_from]: this.state[_from].filter(c => contact.id !== c.id),
      [_to]: [contact].concat(this.state[_to])
    })
  }

  render() {
    return <div className="page delivery">
      <div className="left">
        <div>
          <Button onClick={() => this.checkAll(true)}>все</Button>
          <Button onClick={() => this.checkAll(false)}>никто</Button>
        </div>
        <div className="two-lists">
          <div>
            <h2>Все контакты</h2>
            <ContactList list={this.state.contacts} select={c => this.select(c, false)}/>
          </div>
          <div>
            <h2>Избранные контакты</h2>
            <ContactList list={this.state.selections} select={c => this.select(c, true)}/>
          </div>
        </div>
      </div>
      <div className="right">
        <Form onSubmit={this.onSend}>
          <Form.TextArea name="text" placeholder="Текст"/>
          <Button type="submit">Послать</Button>
        </Form>
      </div>
    </div>
  }
}
