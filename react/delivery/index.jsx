import DeliveryList from './list.jsx'
import DeliveryQueue from './queue.jsx'
import Help from '../widget/help.jsx'
import Message from './message.jsx'
import React from 'react'
import SkypeComponent from '../base/skype-component.jsx'
import {Segment, Header} from 'semantic-ui-react'
import {Status} from '../../app/config'
import {toArray, defaults} from 'lodash'
import Contact from '../entity/contact.jsx'

export default class Delivery extends SkypeComponent {
  send = text =>
    DeliveryQueue.execute(this.state.account, text, this.alert)

  render() {
    return <Segment.Group horizontal className="page delivery">
      <Segment>
        {this.alertMessage()}
        {this.selectAccount()}
        <Message send={this.send}/>
      </Segment>

      <Segment className="contact-list-segment">
        <Help text="Нажмите, чтобы включить контакт в рассылку">
          <Header textAlign="center" as="h2">Ваши контакты</Header>
        </Help>
        <DeliveryList
          query="otherPage"
          delivery
          status={Status.CREATED}
          account={this.props.params.account}
          selected={false}/>
      </Segment>
      <Segment className="contact-list-segment">
        <Help text="Нажмите, чтобы исключить контакт из рассылки">
          <Header textAlign="center" as="h2">Выбранные контакты</Header>
        </Help>
        <DeliveryList
          query="selectedPage"
          delivery
          status={Status.SELECTED}
          account={this.props.params.account}
          selected={true}/>
      </Segment>
    </Segment.Group>
  }
}
