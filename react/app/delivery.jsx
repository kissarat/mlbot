import db from '../database.jsx'
import React, {Component} from 'react'
import SelectAccount from './select-account.jsx'
import Skype from '../skype/index.jsx'
import {Form, Segment, Button, List, Loader, Header, Dimmer} from 'semantic-ui-react'
import {hashHistory} from 'react-router'
import {seq} from '../util/index.jsx'
import {Status} from '../../app/config'
import {toArray} from 'lodash'

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
      setTimeout(async() => {
        try {
          this.loadContacts()
          const skype = await this.getSkype()
          await skype.getProfile()
          await this.setState({busySkype: false})
          this.loadContacts()
        }
        catch (ex) {
          console.error(ex)
        }
      }, 0)
    }
  }

  getSkype() {
    return Skype.open(this.state.account)
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  queryContacts(status) {
    const account = this.state.account
    return db.contact
      .filter(c =>
        account === c.account &&
        status === c.status &&
        c.authorized
      )
  }

   async loadContacts() {
    const find = status => this.queryContacts(status)
      .limit(100)
      .toArray()
    const contacts = await find(Status.CREATED)
    const selections = await find(Status.SELECTED)
    this.setState({
      contacts,
      selections,
      busy: contacts.length + selections.length <= 0
    })
  }

  async selectAll(status) {
    this.setState({busy: true})
    const account = this.state.account
    await db.contact
      .filter(c => c.account === account)
      .modify({status})
    return this.loadContacts()
  }

  onSend = async(e, {formData: {text}}) => {
    e.preventDefault()
    const account = this.state.account
    const skype = await Skype.open(account)

    const contacts = await db.contact
      .where(c =>
        account === c.account &&
        Status.SELECTED === c.status &&
        c.authorized
      )
      .toArray()

    const promises = contacts.map(({id, login}) => async() => {
      await skype.sendMessage({text, login})
      await db.contact.update(id, {status: Status.CREATED})
      return this.loadContacts()
    })

    return seq(promises)
  }

  async select(id, add) {
    const status = add ? Status.SELECTED : Status.CREATED
    await db.contact.update(id, {status})
    return this.loadContacts()
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
            <Button onClick={() => this.selectAll(Status.SELECTED)}>все</Button>
            <Button onClick={() => this.selectAll(Status.CREATED)}>никто</Button>
          </div>
        </Segment>
        <Segment>
          <Loader size="medium" active={!!this.state.busySkype}>{this.state.busySkype}</Loader>
          <Form onSubmit={this.onSend}>
            <Form.TextArea name="text" placeholder="Текст"/>
            <Button type="submit" disabled={!!this.state.busySkype}>Послать</Button>
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
