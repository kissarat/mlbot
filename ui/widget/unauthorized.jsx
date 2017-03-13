import React, {PureComponent} from 'react'
import {Button} from 'semantic-ui-react'
import {Status, Type} from '../../app/config'
import {toArray, defaults} from 'lodash'
import Queue from '../base/queue.jsx'
import db from '../../store/database.jsx'
import Skype from '../../skype/index.jsx'

export default class Unauthorized extends PureComponent {
  state = {
    unauthorizedCount: null
  }

  query() {
    return Queue.query(this.props.account, this.props.type)
  }

  clear = async() => {
    const account = this.props.account
    const queue = new Queue({
      inform: this.props.alert,
      account: account,
      success: (i, count) => `Удалено ${i} из ${count} контактов`,

      query: () => db.contact.where({
        account,
        authorized: 0,
        status: Status.CREATED
      })
        .filter(c => Type.PERSON === c.type),

      work: async(skype, contact) => {
        const {username} = await skype.removeContact(contact.login)
        return this.query().filter(c => username === c.login).delete()
      }
    })
    await queue.execute()
    await this.count()
    this.props.alert('success', 'Серые контакты удалены')
  }

  count = async() => {
    const unauthorizedCount = await this.query().count()
    this.setState({unauthorizedCount})
  }

  componentWillReceiveProps(props) {
    if (this.props.account != props.account) {
      void this.count()
    }
  }

  async componentDidMount() {
    if (this.props.account) {
      await this.count()
    }
    Skype.on('open', this.count)
    Skype.on('contacts', this.count)
  }

  componentWillUnmount() {
    Skype.removeListener('contacts', this.count)
    Skype.removeListener('open', this.count)
  }

  render() {
    return <Button
      className="widget clear-unauthorized"
      type="button"
      disabled={!this.props.account}
      onClick={this.clear}>
      Удалить серые контакты
      {'number' === typeof this.state.unauthorizedCount ? ` (${this.state.unauthorizedCount})` : ''}
    </Button>
  }
}
