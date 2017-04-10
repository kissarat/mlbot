import db from '../../store/database.jsx'
import React, {Component} from 'react'
import Record from '../../store/record.jsx'
import Task from '../../account-manager/task.jsx'
import {isObject, debounce} from 'lodash'
import {joinLog} from '../../store/utils.jsx'
import {Segment, Dimmer, Loader, Header, Table, Icon, Button} from 'semantic-ui-react'
import {Status} from '../../app/config'
import Paginator from '../widget/paginator.jsx'

// checkmark
const StatusText = {
  [Status.NONE]: 'Нету',
  [Status.SELECTED]: 'Неопределено',
  [Status.SCHEDULED]: 'Запланировано',
  [Status.ACCEPTED]: 'Обрабатывается',
  [Status.DONE]: 'Сделано',
}

export default class Log extends Component {
  state = {
    records: [],
    busy: false,
    offset: 0,
    limit: 60,
    count: 0
  }

  componentDidMount() {
    void this.load()
    Record.on('add', this.add)
    Record.on('refresh', this.load)
  }

  componentWillUnmount() {
    Record.removeListener('refresh', this.load)
    Record.removeListener('add', this.add)
  }

  add = async record => {
    const newRecords = [record]
    await joinLog(newRecords)
    this.setState({records: this.state.records.concat(newRecords)})
  }

  load = async() => {
    this.setState({busy: true})
    const count = await db.log.count()
    const records = await db.log
      .offset(this.state.offset)
      .limit(this.state.limit)
      .desc('id')
      .toArray()
    await joinLog(records)
    this.setState({
      busy: false,
      count,
      records
    })
  }

  // loadDebounced = debounce(this.load, 1600)

  async remove(id) {
    await db.log.delete(id)
    return this.load()
  }

  taskNumber(l) {
    const id = isObject(l.task) ? l.task.id : l.task
    const repeat = isObject(l.task) ? l.task.repeat : 1
    const number = repeat > 1 ? repeat - l.number + 1 : 1

    if (isObject) {
      return <Table.Cell>
        задача&nbsp;
        <span className="id">{id}</span>&nbsp;
        {repeat > 1 ? <span>цикл {number}</span> : ''}
      </Table.Cell>
    }
  }

  rows() {
    return this.state.records.map(l => {
      const TaskType = Task[l.task.type]
      return <Table.Row
        key={l.id}
        positive={Status.DONE === l.status}
        negative={Status.ERROR === l.status}
        title={TaskType.title}>
        <Table.Cell><Icon name={TaskType.icon}/></Table.Cell>
        <Table.Cell className="id">{l.id}</Table.Cell>
        <Table.Cell>{l.name}</Table.Cell>
        <Table.Cell>{l.message || StatusText[l.status] || 'Неизвестно'}</Table.Cell>
        {this.taskNumber(l)}
        <Table.Cell className="action">
          <Icon
            name="trash"
            onClick={() => this.remove(l.id)}/>
        </Table.Cell>
      </Table.Row>
    })
  }

  paginator(isHeader) {
    if (this.state.count > 0 && this.state.count > this.state.limit) {
      const row = <Table.Row>
        <Table.HeaderCell colSpan="6">
          <Paginator
            {...this.state}
            changeOffset={this.changeOffset}
          />
        </Table.HeaderCell>
      </Table.Row>

      return isHeader
        ? <Table.Header>{row}</Table.Header>
        : <Table.Footer>{row}</Table.Footer>
    }
  }

  changeOffset = offset => {
    this.setState({offset})
    setTimeout(this.load, 0)
  }

  render() {
    return <Segment className="widget log">
      <Dimmer active={this.state.busy} inverted>
        <Loader/>
      </Dimmer>
      <div>
        <Header textAlign="center" as="h2">Журнал</Header>
        <Table compact="very" size="small">
          {this.paginator(true)}
          <Table.Body>{this.rows()}</Table.Body>
          {this.paginator(false)}
        </Table>
      </div>
    </Segment>
  }
}
