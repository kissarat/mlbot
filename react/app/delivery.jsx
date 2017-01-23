import ContactList from '../widget/contact-list.jsx'
import db from '../database.jsx'
import Help from '../widget/help.jsx'
import React from 'react'
import SelectAccount from './select-account.jsx'
import SkypeComponent from '../base/skype-component.jsx'
import {Form, Segment, Button, Header} from 'semantic-ui-react'
import {wait} from '../util/index.jsx'
import {Status} from '../../app/config'
import {toArray, defaults} from 'lodash'
import Contact from '../entity/contact.jsx'
import Alert from '../widget/alert.jsx'

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

  async selectAll(status) {
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
      const query = {
        account,
        authorized: 1,
        status: Status.SELECTED,
      }
      const contactsCount = await db.contact
        .where(query)
        .count()
      console.log(contactsCount)

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
            .where(query)
            .first()
          console.log(contact)
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

  receiversButton(status, content) {
    status = Status.CREATED === status ? Status.SELECTED : Status.CREATED
    return <Button
      type="button"
      onClick={() => this.selectAll(status)}
      content={content}
      title="Кому отправить сообщение?"
    />
  }

  list(status) {
    if (this.state.account) {
      return super.list({
        condition: {
          account: this.state.account,
          status,
          authorized: 1
        },
        children: this.receiversButton(status, Status.CREATED === status
          ? 'Разослать всем'
          : 'Никому'
        )
      })
    }
    else {
      return ''
    }
  }

  render() {
    return <Segment.Group horizontal className="page delivery">
      <Segment>
        {this.getMessage()}
        <Form onSubmit={this.onSubmit}>
          <SelectAccount
            value={this.state.account}
            select={account => this.changeAccount(account)}/>

          <Form.TextArea
            className="text"
            name="text"
            label="Введите сообщение"
            placeholder="Введите сообщение для его рассылки по выбраным контактам"
            value={this.state.text}
            onChange={this.onChange}/>

          <Button
            type="submit"
            disabled={!this.state.text}
            content="Разослать"
            icon="send"
          />
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
