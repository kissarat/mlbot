import Contact from '../../store/contact.jsx'
import db from '../../store/database.jsx'
import React, {PureComponent} from 'react'
import {Button} from 'semantic-ui-react'
import Task from '../../account-manager/task.jsx'
import {Status, Type} from '../../app/config'
import {toArray, defaults} from 'lodash'

export default class Unauthorized extends PureComponent {
  state = {
    unauthorizedCount: null
  }

  query(props) {
    if (!props) {
      props = this.props
    }
    return db.contact.where({
      account: props.account,
      authorized: 0,
      status: Status.NONE
    })
      .filter(c => Type.PERSON === c.type)
  }

  clear = async() => {
    const contacts = await this.query(this.props).toArray()
    const task = new Task.Clear({
      account: this.props.account,
      contacts: contacts.map(c => c.id)
    })
    await db.task.put(task)
  }

  count = async(props) => {
    this.setState({unauthorizedCount: null})
    const unauthorizedCount = await this.query(props).count()
    this.setState({unauthorizedCount})
  }

  componentWillReceiveProps(props) {
    if (this.props.account != props.account) {
      void this.count(props)
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
