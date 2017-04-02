import db from '../../store/database.jsx'
import Help from '../widget/help.jsx'
import React, {Component, PropTypes} from 'react'
import Record from '../../store/record.jsx'
import Task from '../../store/task.jsx'
import {Segment, Dimmer, Loader, Header, Table, Icon} from 'semantic-ui-react'
import {Status} from '../../app/config'
import {omit} from 'lodash'

const StatusText = {
  [Status.SELECTED]: 'Пауза',
  [Status.SCHEDULED]: 'В очереди',
  [Status.ACCEPTED]: 'Выполняется',
  [Status.DONE]: 'Завершено',
}

export default class TaskList extends Component {
  state = {
    tasks: []
  }

  componentDidMount() {
    void this.refresh()
    Task.on('add', this.add)
    Task.on('update', this.update)
  }

  componentWillUnmount() {
    Task.removeListener('update', this.update)
    Task.removeListener('add', this.add)
  }

  add = task => this.setState({tasks: this.state.tasks.filter(t => task.id != t.id)})

  update = updatedTask => {
    for (const i in this.state.tasks) {
      if (updatedTask.id === this.state.tasks[i].id) {
        this.state.tasks[i] = updatedTask
        return this.setState({tasks: this.state.tasks})
      }
    }
    return this.refresh()
  }

  refresh = () => this.load(this.props)

  async load(props) {
    this.setState({busy: true})
    const q = db.task
    if (props.filter instanceof Function) {
      q.filter(props.filter)
    }
    const tasks = await q
      .toArray()

    tasks.sort((a, b) => b.id - a.id)

    this.setState({
      busy: false,
      tasks
    })
  }

  async remove(id) {
    await db.log.filter(t => id === t.task).delete()
    await db.task.delete(id)
    await this.refresh()
    Record.emit('refresh')
  }

  /**
   * @param {Task} t
   */
  contactsCount(t) {
    return this.props.filter
      ? <Table.Cell/>
      : <Table.Cell>{t.contacts.length} контакты</Table.Cell>
  }

  async copy(t) {
    const newTask = omit(t, 'id')
    newTask.status = Status.SCHEDULED
    await db.task.add(newTask)
    return this.refresh()
  }

  actionIcons(t) {
    const actions = []
    if (Status.DONE === t.status) {
      actions.push(<Icon
        key="copy"
        name="copy"
        onClick={() => this.copy(t)}/>)
    }
    actions.push(<Icon
      key="trash"
      name="trash"
      onClick={() => this.remove(t.id)}/>)
    return actions
  }

  rows() {
    return this.state.tasks.map(t => <Table.Row key={t.id}>
      <Table.Cell className="id">{t.id}</Table.Cell>
      <Table.Cell>{t.account}</Table.Cell>
      <Table.Cell>{t.short}</Table.Cell>
      {this.contactsCount(t)}
      <Table.Cell>{StatusText[t.status] || 'Неизвестно'}</Table.Cell>
      <Table.Cell className="action">
        {this.actionIcons(t)}
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
