import React, {Component} from 'react'
import {Form, Segment, Button, List, Loader, Header, Dimmer} from 'semantic-ui-react'
import Skype from '../skype/index.jsx'
import {toArray} from 'lodash'
import db, {TaskStatus} from '../database.jsx'
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
    const find = status => {
      return db.contact
        .filter(c => c.account === this.state.account && c.status === status)
        .limit(100)
        .toArray()
    }
    return find(TaskStatus.CREATED)
      .then(contacts => {
        this.setState({contacts})
        return find(TaskStatus.SELECTED)
      })
      .then(selections => this.setState({
        selections,
        busy: false
      }))
      .catch(function (err) {
        console.error(err)
      })
  }

  selectAll(status) {
    this.setState({busy: true})
    return db.contact
      // .where('[account]')
      // .equals(this.state.account)
      .filter(c => this.state.account === c.account)
      .modify({status})
      .then(this.loadContacts)
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

  select(id, add) {
    const status = add ? TaskStatus.SELECTED : TaskStatus.CREATED
    db.contact.update(id, {status})
      .then(() => this.loadContacts())
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
            <Button onClick={() => this.selectAll(TaskStatus.SELECTED)}>все</Button>
            <Button onClick={() => this.selectAll(TaskStatus.CREATED)}>никто</Button>
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
          <ContactList list={this.state.contacts} select={c => this.select(c.id, true)}/>
      </div>
      <div>
        <Header textAlign="center" as="h2">Избранные контакты</Header>
          <ContactList list={this.state.selections} select={c => this.select(c.id, false)}/>
      </div>
    </div>
  }
}
