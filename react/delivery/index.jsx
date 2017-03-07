import db from '../database.jsx'
import DeliveryList from './list.jsx'
import Help from '../widget/help.jsx'
import Message from './message.jsx'
import Queue from '../base/queue.jsx'
import React from 'react'
import Skype from '../skype/index.jsx'
import SkypeComponent from '../base/skype-component.jsx'
import Unauthorized from '../widget/unauthorized.jsx'
import {Segment, Header} from 'semantic-ui-react'
import {Status, Type} from '../../app/config'
import {toArray, defaults} from 'lodash'

export default class Delivery extends SkypeComponent {
  name = 'Delivery'

  send = async(text) => {
    const queue = new Queue({
      success: (i, count) => `Отправлено ${i} из ${count}`,
      account: this.state.account,
      inform: this.alert,

      beforeIteration(skype) {
        skype.blank()
      },

      query: () => db.contact.where({
        account: this.state.account,
        authorized: 1,
        status: Status.SELECTED
      })
        .filter(c => this.type() === c.type),

      work: async(skype, contact) => {
        let cid
        if (Type.PERSON === this.type()) {
          cid = '8:' + contact.login
        }
        else {
          cid = `19:${contact.login}@thread.skype`
        }
        await skype.rat.sendMessage(cid, text)
        await db.contact.update(contact.id, {status: Status.CREATED})
      },
    })
    await queue.execute()
    Skype.all().remove()
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

  render() {
    const isChat = Type.CHAT === this.type()
    return <Segment.Group horizontal className="page delivery">
      <Segment>
        {this.alertMessage()}
        {this.selectAccount(true)}
        {this.unauthorized()}
        <Message
          disabled={!this.state.account}
          submit={this.send}/>
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
