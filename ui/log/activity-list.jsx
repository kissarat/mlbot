import React, {Component} from 'react'
import {Status} from '../../app/config'
import db from '../../store/database.jsx'

export default class ActivityList extends Component {
  async load() {
    const log = db.log.filter(a => a.status)
  }

  render() {
    return <div></div>
  }
}
