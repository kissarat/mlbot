import db from '../database.jsx'
import DeliveryList from './list.jsx'
import Help from '../widget/help.jsx'
import Message from './message.jsx'
import Queue from '../base/queue.jsx'
import React from 'react'
import Repeat from './repeat.jsx'
import Skype from '../skype/index.jsx'
import SkypeComponent from '../base/skype-component.jsx'
import Unauthorized from '../widget/unauthorized.jsx'
import {Segment, Header} from 'semantic-ui-react'
import {Status, Type} from '../../app/config'
import {toArray, defaults} from 'lodash'

export default class Delivery extends SkypeComponent {
  name = 'Delivery'

  send = async(template) => {
    const type = this.type()
    const repeatAmount = Type.CHAT === type ? +Repeat.state.repeat : 1
    const account = this.state.account
    const query = () => db.contact.where({
      account,
      authorized: 1,
      status: Status.SELECTED
    })
      .filter(c => type === c.type)
    const current = (await query().toArray()).map(c => c.id)

    const queue = new Queue({
      account,
      query,
      inform: this.alert,

      beforeIteration(skype) {
        skype.blank()
      }
    })

    for (let cycle = 1; cycle <= repeatAmount; cycle++) {
      let text = template.replace(/\{cycle}/g, cycle)

      queue.success = (i, count) => repeatAmount > 1
        ? `Рассылка №${cycle}: Отправлено ${i} из ${count}`
        : `Отправлено ${i} из ${count}`

      queue.work = async(skype, contact) => {
        await skype.send({
          text,
          ...contact
        })
        await db.contact.update(contact.id, {status: Status.CREATED})
      }

      await queue.execute()
      if (cycle < repeatAmount) {
        await db.contact
          .filter(c => current.indexOf(c.id) >= 0)
          .modify({status: Status.SELECTED})
      }
    }
    Skype.removeAll()
    this.alert('success', 'Рассылка завершена')
  }

  type() {
    return 'chat' === this.props.params.type ? Type.CHAT : Type.PERSON
  }

  unauthorized() {
    if ('chat' !== this.props.params.type) {
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
    const isChat = Type.CHAT === this.type()
    return <Segment.Group horizontal className="page delivery">
      <Segment>
        {this.alertMessage()}
        {this.accountSelect(true)}
        {this.unauthorized()}
        <Message
          disabled={!this.state.account}
          submit={this.send}>
          {this.repeat()}
        </Message>
      </Segment>

      <Segment className="contact-list-segment">
        <Help text="Нажмите, чтобы включить контакт в рассылку">
          <Header textAlign="center" as="h2">Ваши {isChat ? 'чаты' : 'контакты'}</Header>
        </Help>
        <DeliveryList
          authorized={1}
          type={this.type()}
          account={this.state.account}
          status={Status.CREATED}/>
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
