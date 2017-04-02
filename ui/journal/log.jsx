import React, {Component, PropTypes} from 'react'
import db from '../../store/database.jsx'
import {Segment, Dimmer, Loader, Header, Table, Icon} from 'semantic-ui-react'
import {joinLog} from '../../store/utils.jsx'
import {Status} from '../../app/config'

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
  }

  async load() {
    this.setState({busy: true})
    const records = await db.log.orderBy('id', 'desc')
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
    return this.state.records.map(l => <Table.Row key={l.id}>
        <Table.Cell className="id">{l.id}</Table.Cell>
        <Table.Cell>{l.name}</Table.Cell>
        <Table.Cell>{l.message || StatusText[l.status] || 'Неизвестно'}</Table.Cell>
        <Table.Cell className="action">
          <Icon
            name="trash"
            onClick={() => this.remove(l.id)}/>
        </Table.Cell>
      </Table.Row>
    )
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
