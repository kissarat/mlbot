import ContactList from '../widget/contact-list.jsx'
import db from '../database.jsx'
import Help from '../widget/help.jsx'
import React from 'react'
import SelectAccount from './select-account.jsx'
import SkypeComponent from '../base/skype-component.jsx'
import {Form, Segment, Button, Loader, Header} from 'semantic-ui-react'
import {wait} from '../util/index.jsx'
import {Status} from '../../app/config'
import {toArray, defaults} from 'lodash'
import Contact from '../entity/contact.jsx'

export default class Delivery extends SkypeComponent {
  persistentProps = ['text', 'account']
  state = {
    contacts: [],
    selections: [],
    busy: false
  }

  initialize() {
    if ('string' !== typeof this.state.account) {
      return
    }
    try {
      if (openSkypeAfterChoose) {
        this.openSkype()
      }
    }
    catch (ex) {
      console.error(ex)
    }
  }

  onChange = e => this.setState({[e.target.getAttribute('name')]: e.target.value})

  loadContacts() {
    console.log('loadContacts')
    // Contact.emit('update')
  }

  async selectAll(status) {
    this.setBusy('Подождите...')
    const account = this.state.account
    await db.contact
      .filter(c => c.account === account)
      .modify({status})
    Contact.emit('update')
  }

  onSubmit = (e, {formData: {text}}) => {
    e.preventDefault()
    this.send(text)
  }

  async send(text) {
    const account = this.state.account
    try {
      const query = c =>
      account === c.account &&
      Status.SELECTED === c.status &&
      c.authorized
      const contactsCount = await db.contact
        .filter(query)
        .count()

      if (contactsCount > 0) {
        const skype = await this.getSkype(true)
        this.setBusy('Подождите 3 секунды')
        await wait(3000)
        this.setBusy('Получение списка рассылки')
        this.setTimeout(() => {
          this.alert('error', `Skype не отвечает в течении ${Math.round(skypeTimeout / 1000)} секунд`)
          skype.remove()
        })
        skype.openSettings()

        const informInvited = i => this.setBusy(`Отправлено ${i} контактам из ${contactsCount}`)

        let i = 0
        const pull = async() => {
          const contact = await db.contact
            .filter(query)
            .first()
          if (!contact) {
            return
          }
          const anwser = await skype.sendMessage({
            id: contact.id,
            login: contact.login,
            text
          })
          await db.contact.update(contact.id, {status: Status.CREATED})
          informInvited(++i)
          this.updateTimeout()
          if (i < contactsCount) {
            await pull()
          }
          Contact.emit('update')
        }

        informInvited(0)
        await pull()
        this.clearTimeout()
        this.alert('success', 'Рассылка завершена')
      }
      else {
        this.alert('error', 'Вы не выбрали ни одного контакта для рассылки')
      }
    }
    catch (ex) {
      console.error(ex)
      this.alert('error', ex)
    }
  }

  async changeStatus(id, status) {
    status = Status.CREATED === status ? Status.SELECTED : Status.CREATED
    await db.contact.update(id, {status})
    Contact.emit('update')
  }

  list(status) {
    return <ContactList
      account={this.state.account}
      changeStatus={this.changeStatus}
      status={status}/>
  }

  render() {
    const text = this.state.text || ''
    const canSend = text
    return <Segment.Group horizontal className="page delivery">
      <Segment>
        {this.getMessage()}
        <Form onSubmit={this.onSubmit}>
          <SelectAccount
            value={this.state.account}
            select={account => this.changeAccount(account)}/>
          <div className="control">
            <strong>Кому отправить сообщение?</strong>
            <div className="control">
              <Button type="button" onClick={() => this.selectAll(Status.SELECTED)}>Всем</Button>
              <Button type="button" onClick={() => this.selectAll(Status.CREATED)}>Никому</Button>
            </div>
          </div>
          <Form.TextArea
            name="text"
            label="Введите сообщение"
            placeholder="Введите сообщение для его рассылки по выбраным контактам"
            value={text}
            onChange={this.onChange}/>
          <Button type="submit" disabled={!canSend}>Разослать</Button>
          {isDevMode ? <Button type="button" floated="right" onClick={this.reset}>Очистить</Button> : ''}
        </Form>
      </Segment>

      <Segment className="contact-list-segment">
        <Help text="Нажмите, чтобы включить контакт в рассылку">
          <Header textAlign="center" as="h2">Ваши контакты</Header>
        </Help>
        {this.list(Status.CREATED)}
      </Segment>
      <Segment className="contact-list-segment">
        <Help text="Нажмите, чтобы исключить контакт из рассылки">
          <Header textAlign="center" as="h2">Выбранные контакты</Header>
        </Help>
        {this.list(Status.SELECTED)}
      </Segment>
    </Segment.Group>
  }
}
