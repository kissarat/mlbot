import ContactList from './contact-list.jsx'
import db from '../database.jsx'
import React, {Component} from 'react'
import SelectAccount from './select-account.jsx'
import {Form, Segment, Button, Input, Loader, Checkbox, Header, Message, Dimmer} from 'semantic-ui-react'
import {seq} from '../util/index.jsx'
import stateStorage from '../util/state-storage.jsx'
import {Status} from '../../app/config'
import {toArray, defaults} from 'lodash'
import {filterSkypeUsernames, setImmediate} from '../util/index.jsx'
import SkypeComponent from './skype-component.jsx'

export default class Invite extends SkypeComponent {
  componentWillReceiveProps(props) {
    let state = stateStorage.register(this.getStorageName(), ['text', 'limit', 'account'], {
      limit: 40,
      sort: false,
      account: '',
      text: '',
      invites: []
    })
    state = defaults(props.params, state)
    this.setState(state)
    setImmediate(() => this.loadContacts())
  }

  filterSkypeUsernames(text) {
    const accounts = filterSkypeUsernames(text)
    if (this.state.sort) {
      accounts.sort()
    }
    return accounts
  }

  loadFromFile(file) {
    const reader = new FileReader()
    reader.onload = e => {
      this.setState({text: this.filterSkypeUsernames(e.target.result).join('\n')})
    }
    reader.readAsText(file)
  }

  limit = () => {
    const number = +this.state.limit
    if (number > 0) {
      const text = this.filterSkypeUsernames(this.state.text)
        .slice(0, number)
        .join('\n')
      this.setState({text})
    }
  }

  onChange = (e, d) => {
    let {name, value, checked} = d
    this.setState({[name]: value || checked})
    if ('sort' === name && checked) {
      setImmediate(() => {
        const text = this.filterSkypeUsernames(this.state.text).join('\n')
        this.setState({text})
      })
    }
  }

  onSubmit = async(e, {formData: {text}}) => {
    e.preventDefault()
    this.invite(this.filterSkypeUsernames(text))
  }

  async invite(usernames) {
    try {
      const account = this.state.account
      if (usernames.length > 0) {
        const existing = (
          await db.contact
            .filter(c => account === c.account)
            .toArray()
        )
          .map(c => c.login)
        usernames = usernames.filter(username => !existing.find(login => username === login))
        const invites = usernames.map(login => ({
          id: account + '~' + login,
          login,
          account,
          authorized: false,
          status: Status.SELECTED
        }))
        await db.contact.bulkAdd(invites)
      }
      await this.loadContacts()
      if (this.state.invites) {
        this.setBusy('Вход в скайп')
        const skype = await this.getSkype()

        const invites = await db.contact
          .filter(c =>
            account === c.account &&
            Status.SELECTED === c.status && !c.authorized
          )
          .toArray()

        const informInvited = i => this.setBusy(`Приглашено ${i} контактов из ${invites.length}`)

        informInvited(0)
        const promises = invites.map((contact, i) => async() => {
          await skype.invite(contact)
          await db.contact.update(contact.id, {status: Status.CREATED})
          informInvited(i)
          return this.loadContacts()
        })

        await seq(promises)
        this.setBusy(false)
        this.alert('success', 'Все преглашены!')
      }
      else {
        this.alert('error', 'Список пуст')
      }
    }
    catch (ex) {
      console.error(ex)
    }
  }

  async loadContacts() {
    const account = this.state.account
    const invites = await db.contact
      .filter(c => account === c.account && Status.SELECTED === c.status && !c.authorized)
      .toArray()
    this.setState({invites})
    return invites
  }

  remove = async contact => {
    await db.contact.delete(contact.id)
    return this.loadContacts()
  }

  render() {
    const message = this.state.alert ? <Message {...this.state.alert}/> : ''
    return <Segment.Group horizontal className="page invite">
      <Dimmer active={!!this.state.busy} inverted>
        <Loader size="medium">{this.state.busy}</Loader>
      </Dimmer>
      <Segment>
        <Form onSubmit={this.onSubmit}>
          {message}
          <Form.Input
            name="file"
            type="file"
            onChange={e => this.loadFromFile(e.target.files[0])}/>
          <div className="limit" style={{display: this.state.text ? 'block' : 'none'}}>
            <Form.Field>
              <Checkbox
                name="sort"
                label="Сортировать логины по алфавиту"
                checked={this.state.sort}
                onChange={this.onChange}/>
            </Form.Field>
            <Form.Field>
              <Button type="button" onClick={this.limit}>Уменьшить</Button>
              и оставить первые
              <Input
                name="limit"
                type="number"
                value={this.state.limit}
                onChange={this.onChange}/>
              контактов
            </Form.Field>
          </div>
          <Form.TextArea
            name="text"
            placeholder="Здесь вы можете вставить список контактов"
            value={this.state.text}
            onChange={this.onChange}/>
          <div>
            <Button type="submit">Пригласить</Button>
            в аккаунт
            <SelectAccount
              value={this.state.account}
              select={account => this.changeAccount(account)}/>
            <Button floated="right" type="button" onClick={this.reset}>Очистить</Button>
          </div>
        </Form>
      </Segment>
      <Segment className="contact-list-segment" disabled={this.state.invites.length <= 0}>
        <Header as='h2'>Очередь приглашений</Header>
        <ContactList
          items={this.state.invites}
        select={this.remove}/>
      </Segment>
    </Segment.Group>
  }
}
