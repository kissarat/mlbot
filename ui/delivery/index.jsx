import ActivityList from '../log/activity-list.jsx'
import db from '../../store/database.jsx'
import Task from '../../store/task.jsx'
import DeliveryList from './list.jsx'
import Help from '../widget/help.jsx'
import Message from './message.jsx'
import React from 'react'
import Repeat from './repeat.jsx'
import SkypeComponent from '../base/skype-component.jsx'
import Unauthorized from '../widget/unauthorized.jsx'
import {Segment, Header} from 'semantic-ui-react'
import {Status, Type} from '../../app/config'
import {toArray, defaults} from 'lodash'

export default class Delivery extends SkypeComponent {
  name = 'Delivery'

  send = async task => {
    task.number = Repeat.state.repeat
    await db.task.add(task)
    Task.emit('add')
  }

  type() {
    return 'chat' === this.props.params.type ? Type.CHAT : Type.PERSON
  }

  unauthorized() {
    if (Type.PERSON === this.type()) {
      return <Unauthorized
        type={Type.PERSON}
        account={this.state.account}
        alert={this.alert}/>
    }
  }

  repeat() {
    if (Type.CHAT === this.type()) {
      return <Repeat/>
    }
  }

  render() {
    const type = this.type()
    const isChat = Type.CHAT === type
    return <Segment.Group horizontal className="page delivery">
      <Segment>
        {this.alertMessage()}
        {this.accountSelect(true)}
        {this.unauthorized()}
        <Message
          disabled={!this.state.account}
          type={type}
          submit={this.send}>
          {this.repeat()}
        </Message>
        <ActivityList/>
      </Segment>

      <Segment className="contact-list-segment">
        <Help text="Нажмите, чтобы включить контакт в рассылку">
          <Header textAlign="center" as="h2">Ваши {isChat ? 'чаты' : 'контакты'}</Header>
        </Help>
        <DeliveryList
          authorized={1}
          type={type}
          account={this.state.account}
          status={Status.NONE}/>
      </Segment>

      <Segment className="contact-list-segment">
        <Help text="Нажмите, чтобы исключить контакт из рассылки">
          <Header textAlign="center" as="h2">Выбранные {isChat ? 'чаты' : 'контакты'}</Header>
        </Help>
        <DeliveryList
          authorized={1}
          type={this.type()}
          account={this.state.account}
          status={Status.SELECTED}/>
      </Segment>
    </Segment.Group>
  }
}
