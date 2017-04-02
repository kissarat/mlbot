import db from '../../store/database.jsx'
import Help from '../widget/help.jsx'
import React, {Component, PropTypes} from 'react'
import Task from '../../store/task.jsx'
import {Segment, Dimmer, Loader, Header, Table, Icon} from 'semantic-ui-react'
import {Status} from '../../app/config'

export default class TaskList extends Component {
  state = {
    tasks: []
  }

  componentDidMount() {
    void this.load(this.props)
    Task.on('add', this.add)
  }

  componentWillUnmount() {
    Task.removeListener('add', this.add)
  }

  add = task => this.state.tasks.unshift(task)

  async load(props) {
    this.setState({busy: true})
    const q = db.task
    if (props.filter instanceof Function) {
      q.filter(props.filter)
    }
    const tasks = await q.toArray()
    for (const task of tasks) {
      task.contacts = task.contacts.length
    }

    // await joinLog(tasks)
    this.setState({
      busy: false,
      tasks
    })
  }

  async remove(id) {
    await db.task.delete(id)
    await this.load(this.props)
  }

  /**
   * @param {Task} t
   */
  contactsCount(t) {
    return this.props.filter
      ? <Table.Cell/>
      : <Table.Cell>{t.contacts} контакты</Table.Cell>
  }

  rows() {
    return this.state.tasks.map(t => <Table.Row key={t.id}>
        <Table.Cell className="id">{t.id}</Table.Cell>
        <Table.Cell>{t.account}</Table.Cell>
        <Table.Cell>{t.short}</Table.Cell>
        {this.contactsCount(t)}
        <Table.Cell className="action">
          <Icon
            name="trash"
            onClick={() => this.remove(t.id)}/>
        </Table.Cell>
      </Table.Row>)
  }

  table() {
    if (this.state.tasks.length > 0) {
      return <div>
        <Help text="Нажмите, чтобы исключить контакт из рассылки">
          <Header textAlign="center" as="h2">Список задач</Header>
        </Help>
        <Table compact="very">
          <Table.Body>{this.rows()}</Table.Body>
        </Table>
      </div>
    }
    else {
      return <Header textAlign="center" as="h2">Нет задач</Header>
    }
  }

  render() {
    return <Segment className="widget task-list">
      <Dimmer active={this.state.busy} inverted>
        <Loader/>
      </Dimmer>
      {this.table()}
    </Segment>
  }
}
