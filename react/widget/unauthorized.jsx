import React, {PureComponent} from 'react'
import {Button} from 'semantic-ui-react'
import {Status} from '../../app/config'
import {toArray, defaults} from 'lodash'
import Queue from '../base/queue.jsx'
import db from '../database.jsx'
import Skype from '../skype/index.jsx'

export default class Unauthorized extends PureComponent {
  state = {
    unauthorizedCount: null
  }

  query() {
    return db.contact.filter(a => a.account === this.props.account && 0 === a.authorized)
  }

  clear = async() => {
    const queue = new Queue({
      inform: this.props.alert,
      account: this.props.account,
      success: (i, count) => `Удалено ${i} из ${count} контактов`,
      async work(skype, contact) {
        return skype.removeContact(contact.login)
      },

      query: this.query()
    })

    await queue.execute()
    await this.count()
    this.props.alert('success', 'Серые контакты удалены')
  }

  count = async () => {
    this.setState({
      unauthorizedCount: await this.query().count()
    })
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
