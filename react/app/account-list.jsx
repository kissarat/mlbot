import React, {Component} from 'react'
import {Link} from 'react-router'
import {List} from 'semantic-ui-react'
import Skype from '../skype/index.jsx'

export default class AccountList extends Component {
  state = {
    accounts: []
  }

  componentWillMount() {
    Skype.loadAccounts().then(accounts => this.setState({accounts}))
  }

  render() {
    const accounts = this.state.accounts.map(a => <List.Item key={a.login}>{a.login}</List.Item>)
    return <div className="page account-list">
      <Link to="/accounts/login">Добавить Skype</Link>
      <List>{accounts}</List>
    </div>
  }
}
