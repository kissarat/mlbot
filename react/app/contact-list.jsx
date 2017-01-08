import React, {Component} from 'react'
import {Form, Table, Checkbox, Button, List} from 'semantic-ui-react'
import {getCollection} from '../database'
import Skype from '../skype'
import {toArray} from 'lodash'

export default class ContactList extends Component {
  componentWillMount() {
    this.setState({
      contacts: toArray(getCollection('contact')),
      contactsSent: []
    })
    Skype.on('profile.contacts', () => this.setState({contacts: getCollection('contact')}))
    Skype.on('message', this.send)
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

  render() {
    const contacts = this.state.contacts.map(c => <Table.Row key={c.id}>
      <Table.Cell><Checkbox onChange={() => this.check(c.id)} checked={c.checked}/></Table.Cell>
      <Table.Cell>{c.login}</Table.Cell>
      <Table.Cell>{c.name}</Table.Cell>
      <Table.Cell>{c.account}</Table.Cell>
    </Table.Row>)

    const contactsSent = this.state.contactsSent.map(c =>
      <List.Item key={c}>{c}</List.Item>)

    return <div className="sender">
      <div className="left">
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
      <div className="right">
        <Form onSubmit={this.onSend}>
          <Form.TextArea name="text" placeholder="Текст"/>
          <Button type="submit">Послать</Button>
        </Form>
        <List>{contactsSent}</List>
      </div>
    </div>
  }
}
