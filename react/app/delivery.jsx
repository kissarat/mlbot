import ContactList from './contact-list.jsx'
import db from '../database.jsx'
import React, {Component} from 'react'
import SelectAccount from './select-account.jsx'
import Skype from '../skype/index.jsx'
import stateStorage from '../util/state-storage.jsx'
import {Form, Segment, Button, List, Loader, Header, Dimmer} from 'semantic-ui-react'
import {hashHistory} from 'react-router'
import {seq, setImmediate} from '../util/index.jsx'
import {Status} from '../../app/config'
import {toArray, defaults} from 'lodash'

const DELIVERY_STORE_KEY = 'message'

export default class Delivery extends Component {
  componentWillReceiveProps(props) {
    let state = stateStorage.register(DELIVERY_STORE_KEY, ['text', 'account'], {
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

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  componentWillUnmount() {
    stateStorage.unregister(DELIVERY_STORE_KEY, this.state)
  }

  componentDidUpdate() {
    stateStorage.save(DELIVERY_STORE_KEY, this.state)
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

  getSkype() {
    return Skype.open(this.state.account)
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

  changeAccount(account) {
    if (account && account.login !== this.state.account) {
      hashHistory.push('/delivery/' + account.login)
    }
    else if (!account) {
      hashHistory.push('/delivery')
    }
  }

  reset = () => this.setState(stateStorage.reset(DELIVERY_STORE_KEY))

  render() {
    return <Segment.Group horizontal className="page delivery">
      <Loader active={this.state.busy} size="medium"/>
      <Segment>
        <Form onSubmit={this.onSend}>
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
        <ContactList list={this.state.contacts} select={c => this.select(c.id, true)}/>
      </Segment>
      <Segment className="contact-list-segment" disabled={this.state.busy}>
        <Header textAlign="center" as="h2">Избранные контакты</Header>
        <ContactList list={this.state.selections} select={c => this.select(c.id, false)}/>
      </Segment>
    </Segment.Group>
  }
}
