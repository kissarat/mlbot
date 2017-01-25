import DeliveryList from './list.jsx'
import DeliveryQueue from './queue.jsx'
import Help from '../widget/help.jsx'
import Message from './message.jsx'
import React from 'react'
import SkypeComponent from '../base/skype-component.jsx'
import {Segment, Header} from 'semantic-ui-react'
import {Status} from '../../app/config'
import {toArray, defaults} from 'lodash'

export default class Delivery extends SkypeComponent {
  send = text => {
    DeliveryQueue.execute(this.state.account, text, this.alert)
    this.alert(false)
  }

  render() {
    return <Segment.Group horizontal className="page delivery">
      <Segment>
        {this.alertMessage()}
        {this.selectAccount()}
        <Message
          disabled={!this.state.account}
          submit={this.send}/>
      </Segment>

      <Segment className="contact-list-segment">
        <Help text="Нажмите, чтобы включить контакт в рассылку">
          <Header textAlign="center" as="h2">Ваши контакты</Header>
        </Help>
        <DeliveryList
          authorized={1}
          account={this.state.account}
          status={Status.CREATED}/>
      </Segment>
      <Segment className="contact-list-segment">
        <Help text="Нажмите, чтобы исключить контакт из рассылки">
          <Header textAlign="center" as="h2">Выбранные контакты</Header>
        </Help>
        <DeliveryList
          authorized={1}
          account={this.state.account}
          status={Status.SELECTED}/>
      </Segment>
    </Segment.Group>
  }
}