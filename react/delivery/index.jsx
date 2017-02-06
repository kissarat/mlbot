import DeliveryList from './list.jsx'
import DeliveryQueue from './queue.jsx'
import Help from '../widget/help.jsx'
import Message from './message.jsx'
import React from 'react'
import SkypeComponent from '../base/skype-component.jsx'
import {Button, Segment, Header} from 'semantic-ui-react'
import {Status} from '../../app/config'
import {toArray, defaults} from 'lodash'
import Queue from '../base/queue.jsx'
import db from '../database.jsx'

export default class Delivery extends SkypeComponent {
  state = {
    online: null,
    unauthorizedCount: null
  }

  unauthorizedQuery() {
    return db.contact.filter(a => a.account === this.state.account && 0 === a.authorized)
  }

  clearUnauthorized = () => {
    const queue = new Queue({
      inform: this.alert,
      success: (i, count) => `Удалено ${i} из ${count} контактов`,
      account: this.state.account,
      async work(skype, contact) {
        return skype.removeContact(contact.login)
      },

      query: this.unauthorizedQuery()
    })

    return queue.execute()
  }

  async countUnauthorized() {
    this.setState({
      unauthorizedCount: await this.unauthorizedQuery().count()
    })
  }

  changeAccount(account) {
    if (account.login) {
      this.setState({
        account: account.login,
        unauthorizedCount: null
      })
    }
  }

  componentDidUpdate(props, state) {
    if (this.state.account != state.account) {
      void this.countUnauthorized()
    }
  }

  async componentDidMount() {
    this.checkSkype()
    if (this.state.account) {
      await this.countUnauthorized()
    }
  }

  send = text => {
    DeliveryQueue.execute(this.state.account, text, this.alert)
    this.alert(false)
  }

  clearUnauthorizedButton() {
    return <Button
      type="button"
      disabled={!this.state.account}
      onClick={this.clearUnauthorized}>
      Удалить серые контакты
      {'number' === typeof this.state.unauthorizedCount ? ` (${this.state.unauthorizedCount})` : ''}
    </Button>
  }

  render() {
    return <Segment.Group horizontal className="page delivery">
      <Segment>
        {this.alertMessage()}
        {this.selectAccount()}
        {this.clearUnauthorizedButton()}
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
          online={this.state.online}
          status={Status.CREATED}/>
      </Segment>
      <Segment className="contact-list-segment">
        <Help text="Нажмите, чтобы исключить контакт из рассылки">
          <Header textAlign="center" as="h2">Выбранные контакты</Header>
        </Help>
        <DeliveryList
          authorized={1}
          account={this.state.account}
          online={this.state.online}
          status={Status.SELECTED}/>
      </Segment>
    </Segment.Group>
  }
}
