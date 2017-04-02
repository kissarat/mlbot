import db from '../../store/database.jsx'
import Help from '../widget/help.jsx'
import React, {Component, PropTypes} from 'react'
import Record from '../../store/record.jsx'
import Task from '../../store/task.jsx'
import {Segment, Dimmer, Loader, Header, Table, Icon} from 'semantic-ui-react'
import {Status} from '../../app/config'
import {omit, debounce} from 'lodash'
import Job from '../../account-manager/job.jsx'
import run from '../../boot/run.jsx'

// pause circle outline
// calendar plus
// dashboard
// checkmark
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
    addEventListener('resize', this.refreshDebounced)
  }

  componentWillUnmount() {
    removeEventListener('resize', this.refreshDebounced)
    Task.removeListener('update', this.update)
    Task.removeListener('add', this.add)
  }

  add = task => this.setState({tasks: this.state.tasks.concat([task])})

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

  refreshDebounced = debounce(this.refresh, 500)

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

  async copy(t) {
    const newTask = omit(t, 'id')
    newTask.status = Status.SCHEDULED
    await db.task.add(newTask)
    return this.refresh()
  }

  contactsCount(t) {
    return this.props.filter
      ? <Table.Cell/>
      : <Table.Cell>{t.contacts.length} контакты</Table.Cell>
  }

  short(t) {
    if (!this.props.filter || innerWidth > 1280) {
      return <Table.Cell>{t.short}</Table.Cell>
    }
  }

  play = async() => {
    if (Job.isRunning) {
      await Job.stop()
      await this.refresh()
    }
    else {
      await Job.start()
    }
    this.setState({running: Job.isRunning})
  }

  action(t) {
    if (!this.props.filter || innerWidth > 1080) {
      return <Table.Cell className="action">
        <Icon
          name="copy"
          onClick={() => this.copy(t)}/>
        <Icon
          name="trash"
          onClick={() => this.remove(t.id)}/>
      </Table.Cell>
    }
  }

  status(t) {
    if (Status.ACCEPTED === t.status) {
      return <img src="images/loading-dots.gif"/>
    }
    return StatusText[t.status] || 'Неизвестно'
  }

  rows() {
    return this.state.tasks.map(t => <Table.Row
      key={t.id}
      positive={Status.DONE === t.status}
      title={Job[t.type].title}>
      <Table.Cell><Icon name={Job[t.type].icon}/></Table.Cell>
      <Table.Cell className="id">{t.id}</Table.Cell>
      <Table.Cell>{t.account}</Table.Cell>
      {this.short(t)}
      {this.contactsCount(t)}
      <Table.Cell>{this.status(t)}</Table.Cell>
      {this.action(t)}
    </Table.Row>)
  }

  table() {
    if (this.state.tasks.length > 0) {
      return <div>
        <Help text="Нажмите, чтобы исключить контакт из рассылки">
          <Header textAlign="center" as="h2">
            <Icon
              onClick={this.play}
              name={Job.isRunning ? 'pause circle outline' : 'play circle outline'}/>
            Список задач
          </Header>
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
