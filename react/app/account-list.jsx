import React, {Component} from 'react'
import {Link} from 'react-router'
import {List, Loader, Icon, Message} from 'semantic-ui-react'
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

    const addSkype = this.state.accounts && this.state.accounts.length > 5
      ? <Message warning>
      <Message.Header>Печалька</Message.Header>
      <p>К сожалению в данной версии приложения вы не можете добавить больше 5-ти скайпов</p>
    </Message>
      : <Link to="/accounts/login">Добавить Skype</Link>
    return <div className="page account-list">
      {addSkype}
      {accounts}
      <Message>
        Добавьте свои аккаунты Skype, с которых Вы планируете рассылать сообщения
        и вести рекламную деятельность в интернете
      </Message>
    </div>
  }
}
