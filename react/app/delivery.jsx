import ContactList from './contact-list.jsx'
import db from '../database.jsx'
import React from 'react'
import SelectAccount from './select-account.jsx'
import stateStorage from '../util/state-storage.jsx'
import {Form, Segment, Button, List, Loader, Header, Dimmer} from 'semantic-ui-react'
import {seq, setImmediate} from '../util/index.jsx'
import {Status} from '../../app/config'
import {toArray, defaults} from 'lodash'
import SkypeComponent from './skype-component.jsx'

export default class Delivery extends SkypeComponent {
  componentWillReceiveProps(props) {
    let state = stateStorage.register(this.getStorageName(), ['text', 'account'], {
      contacts: [],
      selections: [],
      busySkype: 'Вход в скайп'
    })
    state = defaults(props.params, state)
    if (state.account) {
      state.busy = true
      state.busySkype = 'Вход в скайп'
      setImmediate(this.initialize)
    }
    this.setState(state)
  }

  initialize = async() => {
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
  }

  onChange = e => this.setState({[e.target.getAttribute('name')]: e.target.value})

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

  onSubmit = async(e, {formData: {text}}) => {
    e.preventDefault()
    const account = this.state.account
    const skype = await this.getSkype()

    const contacts = await db.contact
      .filter(c =>
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

  render() {
    return <Segment.Group horizontal className="page delivery">
      <Loader active={this.state.busy} size="medium"/>
      <Segment>
        <Form onSubmit={this.onSubmit}>
          <SelectAccount
            value={this.state.account}
            select={account => this.changeAccount(account)}/>
          <div>
            <Button onClick={() => this.selectAll(Status.SELECTED)}>все</Button>
            <Button onClick={() => this.selectAll(Status.CREATED)}>никто</Button>
          </div>
          <Form.TextArea
            name="text"
            placeholder="Текст"
            value={this.state.text}
            onChange={this.onChange}/>
          <Button type="submit" disabled={!!this.state.busySkype}>Послать</Button>
          <Button floated="right" type="button" onClick={this.reset}>Очистить</Button>
        </Form>
      </Segment>
      <Segment className="contact-list-segment" disabled={this.state.busy}>
        <Header textAlign="center" as="h2">Все контакты</Header>
        <ContactList items={this.state.contacts} select={c => this.select(c.id, true)}/>
      </Segment>
      <Segment className="contact-list-segment" disabled={this.state.busy}>
        <Header textAlign="center" as="h2">Избранные контакты</Header>
        <ContactList items={this.state.selections} select={c => this.select(c.id, false)}/>
      </Segment>
    </Segment.Group>
  }
}
