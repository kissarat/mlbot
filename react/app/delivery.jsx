import ContactList from './contact-list.jsx'
import db from '../database.jsx'
import Help from '../widget/help.jsx'
import React from 'react'
import SelectAccount from './select-account.jsx'
import SkypeComponent from './skype-component.jsx'
import stateStorage from '../util/state-storage.jsx'
import {Form, Segment, Button, Loader, Header} from 'semantic-ui-react'
import {seq, setImmediate} from '../util/index.jsx'
import {Status} from '../../app/config'
import {toArray, defaults} from 'lodash'

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
      if (openSkypeAfterChoose) {
        await this.openSkype()
      }
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
    const find = status => {
      const q = this.queryContacts(status)
      return (listLimit ? q.limit(listLimit) : q).toArray()
    }
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
    skype.openSettings()

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
    const text = this.state.text ? this.state.text.trim() : ''
    return <Segment.Group horizontal className="page delivery">
      <Segment>
        <Form onSubmit={this.onSubmit}>
          <SelectAccount
            value={this.state.account}
            select={account => this.changeAccount(account)}/>
          <div className="control">
            <strong>Кому отправить сообщение?</strong>
            <div>
              <Button onClick={() => this.selectAll(Status.SELECTED)}>Всем</Button>
              <Button onClick={() => this.selectAll(Status.CREATED)}>Никому</Button>
            </div>
          </div>
          <Form.TextArea
            name="text"
            label="Введите сообщение"
            placeholder=" Плайсхолдер Пишите текст здесь и он
            отправиться всем Вашим друзьям после нажатия кнопки разослать"
            value={text}
            onChange={this.onChange}/>
          <Button type="submit" disabled={!text || this.state.busy}>Послать</Button>
          {isDevMode ? <Button floated="right" type="button" onClick={this.reset}>Очистить</Button> : ''}
        </Form>
      </Segment>

      <Segment className="contact-list-segment" disabled={this.state.busy}>
        <Help text="Нажмите, чтобы включить контакт в рассылку">
          <Header textAlign="center" as="h2">Ваши контакты</Header>
        </Help>
        <ContactList items={this.state.contacts} select={c => this.select(c.id, true)}/>
      </Segment>
      <Segment className="contact-list-segment" disabled={this.state.busy}>
        <Help text="Нажмите, чтобы исключить контакт из рассылки">
          <Header textAlign="center" as="h2">Избранные контакты</Header>
        </Help>
        <ContactList items={this.state.selections} select={c => this.select(c.id, false)}/>
      </Segment>
    </Segment.Group>
  }
}
