import DeliveryList from './list.jsx'
import DeliveryQueue from './queue.jsx'
import Help from '../widget/help.jsx'
import Message from './message.jsx'
import React from 'react'
import SkypeComponent from '../base/skype-component.jsx'
import {Segment, Header} from 'semantic-ui-react'
import {Status, Type} from '../../app/config'
import {toArray, defaults} from 'lodash'
import Unauthorized from '../widget/unauthorized.jsx'
import Repeat from './repeat.jsx'

export default class Delivery extends SkypeComponent {
  name = 'Delivery'

  send = text => {
    DeliveryQueue.execute(this.state.account, text, this.alert)
    this.alert(false)
  }

  type() {
    return 'chat' === this.props.params.type ? Type.CHAT : Type.PERSON
  }

  componentWillMount() {
    this.setup({
      repeat: 1,
      every: 0
    })
  }

  unauthorized() {
    if ('chat' !== this.props.params.type) {
      return <Unauthorized
        account={this.state.account}
        alert={this.alert}/>
    }
  }

  render() {
    return <Segment.Group horizontal className="page delivery">
      <Segment>
        {this.alertMessage()}
        {this.selectAccount(true)}
        {this.unauthorized()}
        <Message
          disabled={!this.state.account}
          submit={this.send}/>
        <Repeat/>
      </Segment>

      <Segment className="contact-list-segment">
        <Help text="Нажмите, чтобы включить контакт в рассылку">
          <Header textAlign="center" as="h2">Ваши контакты</Header>
        </Help>
        <DeliveryList
          authorized={1}
          type={this.type()}
          account={this.state.account}
          status={Status.CREATED}/>
      </Segment>

      <Segment className="contact-list-segment">
        <Help text="Нажмите, чтобы исключить контакт из рассылки">
          <Header textAlign="center" as="h2">Выбранные контакты</Header>
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
