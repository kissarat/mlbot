import Alert from '../widget/alert.jsx'
import db from '../database.jsx'
import Help from '../widget/help.jsx'
import React, {Component} from 'react'
import SelectAccount from './select-account.jsx'
import SkypeComponent from '../base/skype-component.jsx'
import {filterSkypeUsernames, setImmediate} from '../util/index.jsx'
import {Form, TextArea, Segment, Button, Input, Checkbox, Header} from 'semantic-ui-react'
import {Status} from '../../app/config'
import {toArray, defaults, keyBy, uniq} from 'lodash'
import Contact from '../entity/contact.jsx'
import ContactList from '../widget/contact-list.jsx'

export default class Invite extends SkypeComponent {
  persistentProps = ['list', 'account', 'greeting']
  state = {
    sort: false,
    account: '',
    list: '',
    greeting: '',
    loadFile: false,
    pushQueue: false,
    removeAll: false,
  }

  filterSkypeUsernames(text) {
    const usernames = filterSkypeUsernames(text)
    if (this.state.sort) {
      usernames.sort()
    }
    return usernames
  }

  onClickPushQueue = () => {
    this.pushQueue(this.filterSkypeUsernames(this.state.list))
  }

  async pushQueue(usernames) {
    if (usernames.length > 0) {
      this.setState({pushQueue: true})
      let existing = await db.contact
        .toArray()
      existing = keyBy(existing, 'login')
      usernames = usernames.filter(username => !existing[username])
      if (usernames.length > 0) {
        usernames = uniq(usernames)
        const contacts = Contact.setupMany(usernames.map(login => ({
          login,
          status: Status.SELECTED
        })))
        await db.contact.bulkAdd(contacts)
        Contact.emit('update')
        console.log(`Invite.pushQueue ${usernames.length}`)
        this.setState({
          pushQueue: false,
          list: ''
        })
      }
      else {
        console.warn('Все контакты уже добавлены')
      }
    }
  }

  selectedUnauthorizedQuery = c => this.state.account === c.account && Status.SELECTED === c.status && !c.authorized

  async invite(skype, invitesCount) {
    try {
      const count = await db.contact.where(this.inviteQueueCondition).count()
      if (count <= 0) {
        return void this.alert('error', 'Все контакты уже добавлены')
      }
      const skype = await this.getSkype(true)
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
    catch (ex) {
      console.error(ex)
    }
  }


  remove = async contact => {
    await db.contact.delete(contact.id)
    Contact.emit('update')
  }

  async removeAll() {
    this.setState({removeAll: true})
    await db.contact
      .where({
        status: Status.SELECTED,
        authorized: 0
      })
      .delete()
    Contact.emit('update')
    this.setState({removeAll: false})
  }

  removeAllButton() {
    return <Button
      type="button"
      className="remove-all"
      onClick={() => this.removeAll()}
      icon="trash"
      content="Очистить"/>
  }

  /*
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
   */
  list() {
    return super.list({
      condition: this.inviteQueueCondition,
      sort: 'time',
      children: this.removeAllButton()
    })
  }

  render() {
    return <Segment.Group horizontal className="page invite">
      <Segment compact className="form-segment">
        <Segment.Group>
          {this.getMessage()}
          <Segment.Group horizontal>


            <Segment>
              <h2>Выберите Skype</h2>
              <SelectAccount
                value={this.state.account}
                select={account => this.changeAccount(account)}/>
              <TextArea
                name="greeting"
                className="greeting"
                onChange={this.onChange}
                value={this.state.greeting}

                label="Сообщение-приветствие"
                placeholder="Введите текст, который получит каждый контакт при добавлении в друзья"
              />
              <Button
                type="submit"
                disabled={!this.state.account}
                content="Добавить в друзья"
                icon="add circle"
              />
            </Segment>
          </Segment.Group>

          <Alert warning persist="inviteLimitWarning" attached="bottom">
            Добавляйте в сутки на один Skype-аккаунт не более 40 контактов, потому
            что Microsoft морозит и блокирует Skype. Примерно после 40-ка заявок —
            они перестают доходить к адресатам и висят в воздухе, портя «карму» Вашему Skype.
            Рекомендуем завести 5 скайпов и добавлять в каждый по 40 новых контактов.
          </Alert>
        </Segment.Group>
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
