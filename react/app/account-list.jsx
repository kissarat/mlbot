import React, {Component} from 'react'
import {Link} from 'react-router'
import {List, Loader, Icon} from 'semantic-ui-react'
import Skype from '../skype/index.jsx'
import api from '../connect/api.jsx'
// import {debounce} from 'lodash'

export default class AccountList extends Component {
  state = {
    accounts: false,
  }

  componentWillReceiveProps() {
    // this.setState({accounts: false})
    Skype.getAccountList()
      .then(accounts => this.setState({accounts}))
      .catch(function (err) {
        console.error(err)
      })
  }

  componentWillMount() {
    this.componentWillReceiveProps()
  }

  remove({login}) {
    api.del('skype/remove', {login})
      .then(() => this.componentWillReceiveProps())
      .catch(function (err) {
        console.error(err)
      })
  }

  render() {
    let accounts
    if (this.state.accounts) {
      accounts = this.state.accounts.map(a => <List.Item key={a.login}>
        <List.Content floated="left">{a.login}</List.Content>
        <List.Content floated="right"><Icon name="remove" onClick={() => this.remove(a)}/></List.Content>
      </List.Item>)
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
