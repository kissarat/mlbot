import React, {Component} from 'react'
import {Link} from 'react-router'
import {List, Loader, Icon} from 'semantic-ui-react'
import Skype from '../skype/index.jsx'
import api from '../connect/api.jsx'
import Alert from '../widget/alert.jsx'

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

  addSkype() {
    if (this.state.accounts) {
      if (this.state.accounts.length >= 5) {
        return <Alert warning
        content="К сожалению в данной версии приложения вы не можете добавить больше 5-ти скайпов"/>
      }
      else {
        return <Link to="/accounts/login">Добавить Skype</Link>
      }
    }
  }

  accounts() {
    if (this.state.accounts) {
      const accounts = this.state.accounts.map(a => <List.Item key={a.login}>
        <List.Content floated="left">{a.login}</List.Content>
        <List.Content floated="right"><Icon name="remove" onClick={() => this.remove(a)}/></List.Content>
      </List.Item>)
      return <List>{accounts}</List>
    }
    else {
      return <Loader active size="large">Загрузка списка аккаунтов</Loader>
    }
  }

  render() {
    return <div className="page account-list">
      {this.addSkype()}
      {this.accounts()}
      <Alert info persist="addSkypeHelp"
      content="Добавьте свои аккаунты Skype, с которых Вы планируете рассылать сообщения
        и вести рекламную деятельность в интернете"/>
    </div>
  }
}
