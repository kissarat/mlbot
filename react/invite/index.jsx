import Alert from '../widget/alert.jsx'
import Help from '../widget/help.jsx'
import InviteGreeting from './greeting.jsx'
import InviteList from './list.jsx'
import InviteQueue from './queue.jsx'
import React from 'react'
import SelectAccount from '../app/select-account.jsx'
import SkypeComponent from '../base/skype-component.jsx'
import TextContactEditor from './text-contact-editor.jsx'
import {Segment, Header} from 'semantic-ui-react'
import {Status} from '../../app/config'
import {toArray, defaults, keyBy, uniq} from 'lodash'

export default class Invite extends SkypeComponent {
  invite = greeting =>
    InviteQueue.invite(this.state.account, greeting, this.alert)

  render() {
    const alert = this.state.alert || {visible: false}
    return <Segment.Group horizontal className="page invite">
      <Segment compact className="form-segment">
        <Segment.Group>
          <Alert {...alert}/>
          <Segment.Group horizontal>
            <TextContactEditor/>
            <Segment>
              <h2>Выберите Skype</h2>
              <SelectAccount
                value={this.state.account}
                select={account => this.changeAccount(account)}/>
              <InviteGreeting
                account={this.state.account}
                invite={this.invite}/>
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
        <InviteList/>
      </Segment>
    </Segment.Group>
  }
}
