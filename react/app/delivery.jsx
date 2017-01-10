import React, {Component} from 'react'
import {Form, Segment, Button, List, Loader, Header, Dimmer} from 'semantic-ui-react'
import Skype from '../skype/index.jsx'
import {toArray} from 'lodash'
import db from '../database.jsx'
import {hashHistory} from 'react-router'
import SelectAccount from './select-account.jsx'

export class ContactList extends Component {
  render() {
    const list = this.props.list.map(c => {
      let name = c.login
      if (name !== c.name) {
        name += ` (${c.name})`
      }
      return <List.Item key={c.id} onClick={() => this.props.select(c)}>{name}</List.Item>
    })

    return <List>{list}</List>
  }
}

export default class Delivery extends Component {
  state = {
    contacts: [],
    selections: []
  }

  componentWillReceiveProps(props) {
    if (props.params && props.params.account) {
      const account = props.params.account
      this.setState({
        busy: true,
        account,
        contacts: [],
        selections: [],
        busySkype: 'Вход в скайп'
      })
      setTimeout(() => {
        this.loadContacts()
        this.getSkype()
          .then(skype => skype.getProfile())
          .then(() => this.setState({busySkype: false}))
          .then(this.loadContacts)
      }, 0)
    }
  }

  getSkype() {
    return Skype.open(this.state.account)
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  loadContacts = () => {
    return Skype.queryContacts(this.state.account)
      .limit(100)
      .toArray()
      .then((contacts) => {
        this.setState({
          busy: false,
          contacts
        })
        // Skype.on('message', this.send)
        return contacts
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

  changeAccount(account) {
    if (account && account.login !== this.state.account) {
      hashHistory.push('/delivery/' + account.login)
    }
    else if (!account) {
      hashHistory.push('/delivery')
    }
  }

  render() {
    return <div className="page delivery">
      <Loader active={this.state.busy} size="medium"/>
      <Segment.Group>
        <Segment>
          <SelectAccount
            value={this.state.account}
            select={account => this.changeAccount(account)}/>
          <div>
            <Button onClick={() => this.checkAll(true)}>все</Button>
            <Button onClick={() => this.checkAll(false)}>никто</Button>
          </div>
        </Segment>
        <Segment>
          <Loader size="medium" active={!!this.state.busySkype}>{this.state.busySkype}</Loader>
          <Form onSubmit={this.onSend}>
            <Form.TextArea name="text" placeholder="Текст"/>
            <Button type="submit">Послать</Button>
          </Form>
        </Segment>
      </Segment.Group>
      <div>
        <Header textAlign="center" as="h2">Все контакты</Header>
          <ContactList list={this.state.contacts} select={c => this.select(c, false)}/>
      </div>
      <div>
        <Header textAlign="center" as="h2">Избранные контакты</Header>
          <ContactList list={this.state.selections} select={c => this.select(c, true)}/>
      </div>
    </div>
  }
}
