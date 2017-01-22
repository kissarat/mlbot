import Alert from '../widget/alert.jsx'
import db from '../database.jsx'
import Help from '../widget/help.jsx'
import React, {Component} from 'react'
import SelectAccount from './select-account.jsx'
import SkypeComponent from '../base/skype-component.jsx'
import {filterSkypeUsernames, setImmediate} from '../util/index.jsx'
import {Form, Segment, Button, Input, Checkbox, Header, Divider} from 'semantic-ui-react'
import {Status} from '../../app/config'
import {toArray, defaults, keyBy} from 'lodash'
import Contact from '../entity/contact.jsx'

export default class Invite extends SkypeComponent {
  persistentProps = ['list', 'account', 'greeting']
  state = {
    limit: 40,
    sort: false,
    account: '',
    list: '',
    greeting: '',
    isFileChosen: false,
    listBusy: false
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
    this.setState({
      isFileChosen: false,
      listBusy: true
    })
    const reader = new FileReader()
    reader.onload = e => {
      const list = this.filterSkypeUsernames(e.target.result)
      if (isDevMode) {
        this.setState({list: list.join('\n')})
      }
      else {
        this.addToInviteList(list)
          .then(() => {
            this.setState({listBusy: false})
            Contact.emit('upload')
          })
      }
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
        this.setState({list: this.filterSkypeUsernames(this.state.list).join('\n')})
      })
    }
  }

  onSubmit = async(e, {formData: {list}}) => {
    e.preventDefault()
    this.invite(this.filterSkypeUsernames(list))
  }

  async addToInviteList(usernames) {
    // const account = this.state.account
    if (usernames.length > 0) {
      let existing = await db.contact
        .toArray()
      existing = keyBy(existing, 'login')
      usernames = usernames.filter(username => !existing[username])
      console.log(usernames.length)
      const contacts = Contact.setupMany(usernames.map(login => ({
        login,
        status: Status.SELECTED
      })))
      await db.contact.bulkAdd(contacts)
    }
  }

  selectedUnauthorizedQuery = c => this.state.account === c.account && Status.SELECTED === c.status && !c.authorized

  async invite(usernames) {
    try {
      await this.addToInviteList(usernames)
      Contact.emit('upload')
      const count = await db.contact.filter(this.selectedUnauthorizedQuery).count()
      if (count > 0) {
        const skype = await this.getSkype(true)
        this.processInviteList(skype, count)
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
    this.setTimeout(() => {
      this.alert('error', `Skype не отвечает в течении ${Math.round(skypeTimeout / 1000)} секунд`)
      skype.remove()
    })
    skype.openSettings()

    if (invitesCount > 40) {
      invitesCount = 40
    }

    const informInvited = i => this.setBusy(`Приглашено ${i} контактов из ${invitesCount}`)

    let i = 0
    const pull = async() => {
      const contact = await db.contact
        .filter(this.selectedUnauthorizedQuery)
        .first()
      if ('string' === typeof this.state.greeting) {
        skype.invite(contact.login, this.state.greeting.trim())
      }
      else {
        skype.invite(contact.login)
      }
      if (Status.ABSENT === answer.status) {
        await db.contact.delete(contact.id)
      }
      else {
        await db.contact.update(contact.id, {status: Status.CREATED})
      }
      informInvited(++i)
      this.updateTimeout()
      Contact.emit('upload')
      if (i < invitesCount) {
        await pull()
      }
    }

    informInvited(0)
    await pull()
    this.clearTimeout()
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
    Contact.emit('update')
  }

  async removeAll() {
    this.setState({listBusy: true})
    await db.contact
      .where({
        account: this.state.account,
        status: Status.SELECTED,
        authorized: 0
      })
      .delete()
    Contact.emit('update')
  }

  removeAllButton() {
    return <Button
      type="button"
      className="remove-all"
      onClick={() => this.removeAll()}
      icon="trash"
      content="Очистить"/>
  }

  buildPredicate() {
    if (this.state.account) {
      const account = this.state.account
      return function assigned(c) {
        return Status.SELECTED === c.status && !c.authorized && (!c.account || account === c.account)
      }
    }
    else {
      return function notAssigned(c) {
        return Status.SELECTED === c.status && !c.authorized && !c.account
      }
    }
  }

  list() {
    return super.list({
      condition: this.buildPredicate(),
      sort: 'time',
      children: this.removeAllButton()
    })
  }

  limitListControls() {
    return isDevMode ? <div className="limit" style={{display: this.state.list ? 'block' : 'none'}}>
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
  }

  fileLoadButton() {
    return <div className="load-file">
      <input
        style={{display: this.state.isFileChosen ? 'block' : 'none'}}
        name="file"
        type="file"
        ref="file"
        onChange={e => this.loadFromFile(e.target.files[0])}/>
      <Button
        style={{display: this.state.isFileChosen ? 'none' : 'block'}}
        loading={this.state.listBusy}
        type="button"
        className="open-file"
        onClick={this.onClickOpenFile}
        content="Загрузите файл c контактами"
        icon="file text outline"
        disabled={!this.state.account}/>
    </div>
  }

  render() {
    return <Segment.Group horizontal className="page invite">
      {this.getMessage()}
      <Segment compact className="form-segment">
        <Form onSubmit={this.onSubmit}>
          <Segment.Group>
            <Segment.Group horizontal>
              <Segment>
                <h2>Добавьте контакты</h2>
                {this.fileLoadButton()}
                <small>или</small>
                <Form.TextArea
                  className="contacts"
                  name="list"
                  label="Вставьте контакты"
                  placeholder="Вставьте список из 40-ка Skype-контактов для добавления в друзья"
                  value={this.state.list}
                  onChange={this.onChange}/>
              </Segment>
              <Segment>
                <h2>Выберите Skype</h2>
                <SelectAccount
                  value={this.state.account}
                  select={account => this.changeAccount(account)}/>
                <Form.TextArea
                  name="greeting"
                  className="greeting"
                  label="Сообщение-приветствие"
                  placeholder="Введите текст, который получит каждый контакт при добавлении в друзья"
                  value={this.state.greeting}
                  onChange={this.onChange}/>
                <Button
                  type="submit"
                  disabled={!this.state.account}
                  content="Добавить в очередь"
                  icon="add circle"/>
                {isDevMode ? <Button floated="right" type="button" onClick={this.reset}>Очистить</Button> : ''}
              </Segment>
            </Segment.Group>

            <Alert warning persist="inviteLimitWarning" attached="bottom">
              Добавляйте в сутки на один Skype-аккаунт не более 40 контактов, потому
              что Microsoft морозит и блокирует Skype. Примерно после 40-ка заявок —
              они перестают доходить к адресатам и висят в воздухе, портя «карму» Вашему Skype.
              Рекомендуем завести 5 скайпов и добавлять в каждый по 40 новых контактов.
            </Alert>
          </Segment.Group>
        </Form>
      </Segment>
      <Segment className="contact-list-segment">
        <Help text="Список контактов, которые будут приглашатся, когда вы нажмете на кнопку Добавить">
          <Header as='h2'>Очередь приглашений</Header>
        </Help>
        {this.list()}
      </Segment>
    </Segment.Group>
  }
}
