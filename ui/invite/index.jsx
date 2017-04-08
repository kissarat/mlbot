import Alert from '../widget/alert.jsx'
import db from '../../store/database.jsx'
import Help from '../widget/help.jsx'
import InviteGreeting from './greeting.jsx'
import InviteList from './list.jsx'
import React from 'react'
import SkypeComponent from '../base/skype-component.jsx'
import Task from '../../account-manager/task.jsx'
import TextContactEditor from './text-contact-editor.jsx'
import {Segment, Header} from 'semantic-ui-react'
import {Status, Type} from '../../app/config'
import {toArray, defaults, keyBy, uniq} from 'lodash'
import AccountManager from '../account/index.jsx'

export default class Invite extends SkypeComponent {
  name = 'Invite'

  invite = async text => {
    const account = await AccountManager.get(this.props.account)
    let contacts = await Task.Invite.query()
      .limit(account.max_invite)
      .toArray()
    if (contacts.length > 0) {
      let ids = contacts.map(c => c.id)
      await db.task.put(task)
      await db.contacts.filter(c => ids.indexOf(c.id) >= 0).delete()
      for(const contact of contacts) {
        contact.account = this.props.account
        contact.id = contact.account + '~' + contact.login
        contact.status = Status.SCHEDULED
        contact.text = text
      }
      const found = await db.contacts
        .filter(c => ids.indexOf(c.id) >= 0)
        .toArray()
      ids = found.map(c => c.id)
      contacts = contacts.filter(c => ids.indexOf(c.id) < 0)
      await db.contacts.bulkPut(contacts)
    }
    else {
      this.alert('error', 'Вы не выбрали ни одного контакта')
    }
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
