import ContactList from './contact-list.jsx'
import db from '../database.jsx'
import React, {Component} from 'react'
import SelectAccount from './select-account.jsx'
import Skype from '../skype/index.jsx'
import {Form, Segment, Button, List, Loader, Header, Dimmer} from 'semantic-ui-react'
import {hashHistory} from 'react-router'
import {seq} from '../util/index.jsx'
import {Status} from '../../app/config'
import {toArray} from 'lodash'

export default class Invite extends Component {
  state = {}

  componentWillMount() {
    // this.componentWillReceiveProps(this.props)
  }

  render() {
    return <div className="page invite">
      <Loader active={this.state.busy} size="medium"/>
    </div>
  }
}
