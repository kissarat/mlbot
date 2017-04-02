import React, {Component} from 'react'
import TaskList from './task-list.jsx'
import {Segment} from 'semantic-ui-react'
import Log from './log.jsx'

export default class Journal extends Component {
  render() {
    return <Segment.Group horizontal className="page journal">
      <TaskList/>
      <Log/>
    </Segment.Group>
  }
}
