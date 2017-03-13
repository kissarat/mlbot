import Contact from '../../store/contact.jsx'
import db from '../../store/database.jsx'
import Queue from '../base/queue.jsx'
import React, {PureComponent} from 'react'
import {Button} from 'semantic-ui-react'
import {Status, Type} from '../../app/config'
import {toArray, defaults} from 'lodash'

export default class Unauthorized extends PureComponent {
  state = {
    unauthorizedCount: null
  }

  query() {
    return db.contact.where({
      account: this.props.account,
      authorized: 0,
      status: Status.CREATED
    })
      .filter(c => Type.PERSON === c.type)
  }

  clear = async() => {
    const account = this.props.account
    const queue = new Queue({
      inform: this.props.alert,
      account: account,
      success: (i, count) => `Удалено ${i} из ${count} контактов`,

      query: () => this.query(),

      work: async(skype, contact) => {
        const {id} = await skype.remove(contact)
        return this.query().filter(c => id === c.id).delete()
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
    // Skype.on('open', this.count)
    Contact.on('update', this.count)
  }

  componentWillUnmount() {
    Contact.removeListener('update', this.count)
    // Skype.removeListener('open', this.count)
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
