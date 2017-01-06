import React, {Component} from 'react'
import {Link} from 'react-router'
import {Button, List} from 'semantic-ui-react'

export default class App extends Component {
  state = {
    accounts: []
  }

  componentWillMount() {
    api.get('skype/accounts').then(accounts => this.setState({accounts}))
  }

  render() {
    const accounts = this.state.accounts.map(a =>
      <List.Item key={a.username}>{a.username}</List.Item>
    )
    return <div className="layout app">
      <div>
        <Link to="/skype/login">Добавить Skype</Link>
        <List>{accounts}</List>
      </div>
      {this.props.children}
    </div>
  }
}
