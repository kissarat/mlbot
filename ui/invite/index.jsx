import Alert from '../widget/alert.jsx'
import db from '../../store/database.jsx'
import Help from '../widget/help.jsx'
import InviteGreeting from './greeting.jsx'
import InviteList from './list.jsx'
import Queue from '../base/queue.jsx'
import React from 'react'
import SkypeComponent from '../base/skype-component.jsx'
import TextContactEditor from './text-contact-editor.jsx'
import {Segment, Header} from 'semantic-ui-react'
import {Status, Type} from '../../app/config'
import {toArray, defaults, keyBy, uniq} from 'lodash'

export default class Invite extends SkypeComponent {
  name = 'Invite'

  invite = async text => {
    const account = this.state.account
    const queue = new Queue({
      success: (i, count) => `Приглашено ${i} контактов из ${count}`,
      account,
      inform: this.alert,
      max: 40,

      query: () => db.contact.where({
        authorized: 0,
        status: Status.SELECTED
      })
        .filter(c => Type.PERSON === c.type),

      work: async(skype, contact) => {
        const answer = await skype.invite(text ? {text, ...contact} : contact)
        const isAbsent = Status.ABSENT === answer.status
        if (isAbsent) {
          this.alert('busy', `Контакт ${contact.login} не существует!`)
          db.contact.delete(contact.id)
        }
        /*
        await db.contact.delete(contact.id)
        if (!isAbsent) {
          await db.contact.put({
            id: account + '~' + contact.login,
            account,
            status: Status.NONE,
            authorized: 0
          })
        }
        */
        if (!isAbsent) {
          await db.contact.update(contact.id, {status: Status.NONE})
        }
      },
    })
    await queue.execute()
    this.alert('success', 'Приглашение завершено')
  }

  render() {
    return <Segment.Group horizontal className="page invite">
      <Segment compact className="form-segment">
        <Segment.Group>
          {this.alertMessage()}
          <Segment.Group horizontal>
            <TextContactEditor/>
            <Segment>
              <h2>Выберите Skype</h2>
              {this.accountSelect()}
              <InviteGreeting
                disabled={!this.state.account}
                submit={this.invite}/>
            </Segment>
          </Segment.Group>

          <Alert warning persist="inviteLimitWarning" attached="bottom" content="
          Добавляйте в сутки на один Skype-аккаунт не более 40 контактов, потому
          что Microsoft морозит и блокирует Skype. Примерно после 40-ка заявок —
          они перестают доходить к адресатам и висят в воздухе, портя «карму» Вашему Skype.
          Рекомендуем завести 5 скайпов и добавлять в каждый по 40 новых контактов.
          "/>
        </Segment.Group>
      </Segment>
      <Segment className="contact-list-segment">
        <Help text="Список контактов, которые будут приглашатся, когда вы нажмете на кнопку Добавить">
          <Header as='h2'>Очередь приглашений</Header>
        </Help>
        <InviteList
          type={Type.PERSON}
        />
      </Segment>
    </Segment.Group>
  }
}