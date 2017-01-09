import React, {Component} from 'react'
import {Link} from 'react-router'
import {List, Loader} from 'semantic-ui-react'
import Skype from '../skype/index.jsx'

export default class AccountList extends Component {
  componentWillReceiveProps() {
    this.setState({accounts: false})
    Skype.getAccountList()
      .then(accounts => this.setState({accounts}))
      .catch(function (err) {
        console.error(err)
      })
  }

  componentWillMount() {
    this.componentWillReceiveProps()
  }

  render() {
    let accounts
    if (this.state.accounts) {
      accounts = this.state.accounts.map(a => <List.Item key={a.login}>{a.login}</List.Item>)
      accounts = <List>{accounts}</List>

    }
    else {
      accounts = <Loader active size="large">Загрузка списка аккаунтов</Loader>
    }
    return <div className="page account-list">
      <Link to="/accounts/login">Добавить Skype</Link>
      {accounts}
    </div>
  }
}
