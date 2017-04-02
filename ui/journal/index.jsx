import React, {Component} from 'react'
import TaskList from './task-list.jsx'
import {Segment} from 'semantic-ui-react'

export default class Journal extends Component {
  render() {
    return <Segment.Group>
      <TaskList/>
    </Segment.Group>
  }
}
