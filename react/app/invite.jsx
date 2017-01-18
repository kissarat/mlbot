import config from '../../app/config'
import ContactList from './contact-list.jsx'
import db from '../database.jsx'
import Help from '../widget/help.jsx'
import React, {Component} from 'react'
import SelectAccount from './select-account.jsx'
import SkypeComponent from './skype-component.jsx'
import stateStorage from '../util/state-storage.jsx'
import {filterSkypeUsernames, setImmediate, wait} from '../util/index.jsx'
import {Form, Segment, Button, Input, Loader, Checkbox, Header, Message, Dimmer} from 'semantic-ui-react'
import {Status} from '../../app/config'
import {toArray, defaults} from 'lodash'

export default class Invite extends SkypeComponent {
  componentWillReceiveProps(props) {
    let state = stateStorage.register(this.getStorageName(), ['list', 'greeting', 'limit', 'account'], {
      limit: 40,
      sort: false,
      account: '',
      list: '',
      greeting: '',
      isFileChosen: false,
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

  onClickOpenFile = e => {
    this.setState({isFileChosen: false})
    this.refs.file.click()
  }

  loadFromFile(file) {
    this.setState({isFileChosen: !!file})
    const reader = new FileReader()
    reader.onload = e => {
      this.setState({list: this.filterSkypeUsernames(e.target.result).join('\n')})
    }
    reader.readAsText(file)
  }

  limit = () => {
    const number = +this.state.limit
    if (number > 0) {
      const list = this.filterSkypeUsernames(this.state.list)
        .slice(0, number)
        .join('\n')
      this.setState({list})
    }
  }

  onChange = (e, d) => {
    let {name, value, checked} = d
    this.setState({[name]: value || checked})
    if ('sort' === name && checked) {
      setImmediate(() => {
        const list = this.filterSkypeUsernames(this.state.list).join('\n')
        this.setState({list})
      })
    }
  }

  onSubmit = async(e, {formData: {list}}) => {
    e.preventDefault()
    this.invite(this.filterSkypeUsernames(list))
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
      const invites = await this.loadContacts()
      if (this.state.invites.length > 0) {
        this.setBusy('Вход в скайп')
        const skype = await this.getSkype()
        setTimeout(() => this.processInviteList(skype, invites.length), config.start.delay)
      }
      else {
        this.alert('error', 'Все контакты уже добавлены')
      }
    }
    catch (ex) {
      console.error(ex)
    }
  }

  async processInviteList(skype, invitesCount) {
    skype.openSettings()
    const query = c => this.state.account === c.account && Status.SELECTED === c.status && !c.authorized

    if (invitesCount > 40) {
      invitesCount = 40
    }

    const informInvited = i => this.setBusy(`Приглашено ${i} контактов из ${invitesCount}`)

    let i = 0
    const pull = async() => {
      const contact = await db.contact
        .filter(query)
        .first()
      const answer = await skype.invite(contact.login, this.state.greeting.trim() || '')
      if (Status.ABSENT === answer.status) {
        await db.contact.delete(contact.id)
      }
      else {
        await db.contact.update(contact.id, {status: Status.CREATED})
      }
      informInvited(++i)
      await this.loadContacts()
      if (i < invitesCount) {
        await pull()
      }
    }

    informInvited(0)
    await pull()
    this.setBusy(false)
    this.alert('success', 'Все преглашены!')
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
    const limit = isDevMode ? <div className="limit" style={{display: this.state.list ? 'block' : 'none'}}>
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
    </div> : ''

    return <Segment.Group horizontal className="page invite">
      <Segment>
        <Form onSubmit={this.onSubmit}>
          {this.getMessage()}
          <input
            style={{display: this.state.isFileChosen ? 'block' : 'none'}}
            name="file"
            type="file"
            ref="file"
            onChange={e => this.loadFromFile(e.target.files[0])}/>
          <Button
            style={{display: this.state.isFileChosen ? 'none' : 'block'}}
            type="button"
            className="open-file"
            onClick={this.onClickOpenFile}>
            Выберите файл для загрузки контактов
          </Button>
          {limit}
          <div className="text-fields">
            <Form.TextArea
              name="list"
              label="Вставьте контакты"
              placeholder="Вставьте список из 40-ка Skype-контактов для добавления в друзья"
              value={this.state.list}
              onChange={this.onChange}/>
            <Form.TextArea
              name="greeting"
              label="Сообщение-приветствие"
              placeholder="Введите текст, который получит каждый контакт при добавлении в друзья"
              value={this.state.greeting}
              onChange={this.onChange}/>
            <div>
              <label htmlFor="select-skype">Выберете Skype</label>
              <SelectAccount
                value={this.state.account}
                select={account => this.changeAccount(account)}/>
              <Button type="submit" disabled={!this.state.account}>Добавить</Button>
              {isDevMode ? <Button floated="right" type="button" onClick={this.reset}>Очистить</Button> : ''}
            </div>
          </div>
          <Message>
            Добавляйте в сутки на один Skype-аккаунт не более 40 контактов, потому
            что Microsoft морозит и блокирует Skype. Примерно после 40-ка заявок —
            они перестают доходить к адресатам и висят в воздухе, портя «карму» Вашему Skype.
            Рекомендуем завести 5 скайпов и добавлять в каждый по 40 новых контактов.
          </Message>
        </Form>
      </Segment>
      <Segment className="contact-list-segment" disabled={this.state.invites.length <= 0}>
        <Help text="Список контактов, которые будут приглашатся, когда вы нажмете на кнопку Добавить">
          <Header as='h2'>Очередь приглашений</Header>
        </Help>
        <div className="control">
          <Button className="remove-all" type="button">Удалить всех</Button>
        </div>
        <ContactList
          items={this.state.invites}
          select={this.remove}/>
      </Segment>
    </Segment.Group>
  }
}
