import TaskList from '../journal/task-list.jsx'
import db from '../../store/database.jsx'
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
import Task from '../../account-manager/task.jsx'

export default class Delivery extends SkypeComponent {
  name = 'Delivery'

  querySelected() {
    const type = this.type()
    return db.contact.filter(c =>
      type === c.type &&
      Status.SELECTED === c.status &&
      this.state.account === c.account
    )
  }

  send = async task => {
    task.number = Repeat.state.repeat
    const contacts = await this.querySelected().toArray()
    if (contacts.length > 0) {
      task.account = this.state.account
      task.contacts = contacts.map(c => c.id)
      task.type = Task.Delivery.name
      task.status = Status.SCHEDULED
      await task.create()
      await this.querySelected().modify({status: Status.NONE})
      Task.emit('add', task)
      this.alert('success', `Рассылка ${contacts.length} контактам запланирована в очередь задач`)
    }
    else {
      this.alert('error', 'Вы не выбрали ни одного контакта')
    }
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
        <TaskList filter={c => c.status !== Status.DONE}/>
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
