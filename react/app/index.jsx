import React, {Component} from 'react'
import {Link} from 'react-router'
import {List} from 'semantic-ui-react'
import Skype from '../skype/index.jsx'

export default class App extends Component {
  state = {
    accounts: []
  }

  componentWillMount() {
    api.get('skype/accounts').then(accounts => {
      accounts.forEach(function (account) {
        Skype.open(account)
      })
      this.setState({accounts})
    })
  }

  render() {
    const accounts = this.state.accounts.map(a =>
      <List.Item key={a.login}>{a.login}</List.Item>
    )
    return <div className="layout app">
      <div className="left">
        <Link to="/skype/login">Добавить Skype</Link>
        <List>{accounts}</List>
      </div>
      <div className="right">
        <nav>
          <Link to="/messages">Рассылка сообщений</Link>
        </nav>
        <div className="content">{this.props.children}</div>
      </div>
    </div>
  }
}
