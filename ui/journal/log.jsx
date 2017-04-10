import db from '../../store/database.jsx'
import React, {Component} from 'react'
import Record from '../../store/record.jsx'
import Task from '../../account-manager/task.jsx'
import {isObject} from 'lodash'
import {joinLog} from '../../store/utils.jsx'
import {Segment, Dimmer, Loader, Header, Table, Icon} from 'semantic-ui-react'
import {Status} from '../../app/config'

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
    busy: false
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
    const records = await db.log
      .orderBy('id', 'desc')
      .limit(300)
      .toArray()
    window._records = records
    await joinLog(records)
    this.setState({
      busy: false,
      records
    })
  }

  async remove(id) {
    await db.log.delete(id)
    return this.load()
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
        <Table.Cell>задача <span className="id">{isObject(l.task) ? l.task.id : l.task}</span></Table.Cell>
        <Table.Cell className="action">
          <Icon
            name="trash"
            onClick={() => this.remove(l.id)}/>
        </Table.Cell>
      </Table.Row>
    })
  }

  render() {
    return <Segment className="widget log">
      <Dimmer active={this.state.busy} inverted>
        <Loader/>
      </Dimmer>
      <div>
        <Header textAlign="center" as="h2">Журнал</Header>
        <Table compact="very">
          <Table.Body>{this.rows()}</Table.Body>
        </Table>
      </div>
    </Segment>
  }
}
