import React, {Component, PropTypes} from 'react'
import db from '../../store/database.jsx'
import {Segment, Dimmer, Loader, Header, Table, Icon} from 'semantic-ui-react'
import {joinLog} from '../../store/utils.jsx'
import {Status} from '../../app/config'

const statusText = {
  [Status.DONE]: 'Сделано'
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

  rows() {
    return this.state.records.map(t => <Table.Row key={t.id}>
        <Table.Cell className="id">{t.id}</Table.Cell>
        <Table.Cell>{t.name}</Table.Cell>
        <Table.Cell className="action">
          <Icon
            name="trash"
            onClick={() => this.remove(t.id)}/>
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
