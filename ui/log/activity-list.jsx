import React, {Component} from 'react'
import {Status} from '../../app/config'
import db from '../../store/database.jsx'
import {joinLog} from '../../store/utils.jsx'

export default class ActivityList extends Component {
  state = {
    log: []
  }

  componentWillMount() {
    void this.load()
  }

  async load() {
    const log = await db.log
      .filter(a => Status.SCHEDULED === a.status)
      .toArray()
    await joinLog(log)
    this.setState({log})
  }

  records() {
    return this.state.log.map(r => {
      const text = r.message ? r.message.text.slice(0, 30) : ''
      return <tr key={r.id}>
        <td>{r.id}</td>
        <td>{r.contact.account}</td>
        <td>{r.contact.login}</td>
        <td>{text}</td>
      </tr>
    })
  }

  render() {
    return <div>
      <table>{this.records()}</table>
    </div>
  }
}
