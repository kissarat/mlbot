import Alert from '../widget/alert.jsx'
import api from '../connect/api.jsx'
import React, {Component} from 'react'
import {Link} from 'react-router'
import {List, Loader, Icon, Segment} from 'semantic-ui-react'
import AccountManager from '../../account-manager/index.jsx'

export default class AccountList extends Component {
  state = {
    accounts: false,
  }

  async load() {
    const accounts = await AccountManager.getList()
    this.setState({accounts})
  }

  componentWillMount() {
    void this.load()
  }

  async remove({login}) {
    await api.del('skype/remove', {login})
    await this.load()
  }

  addSkype() {
    if (this.state.accounts instanceof Array) {
      if (this.state.accounts.length >= 20) {
        return <Alert
          warning
          content="К сожалению в данной версии приложения вы не можете добавить больше 20-ти скайпов"/>
      }
      else {
        return <Link to="/accounts/login">Добавить Skype</Link>
      }
    }
  }

  accounts() {
    if (this.state.accounts instanceof Array) {
      const accounts = this.state.accounts.map(({info}) => <List.Item key={info.login}>
        <List.Content floated="left">{info.login}</List.Content>
        <List.Content floated="right"><Icon name="remove" onClick={() => this.remove(info)}/></List.Content>
      </List.Item>)
      return <List>{accounts}</List>
    }
    else {
      return <Loader active size="large">Загрузка списка аккаунтов</Loader>
    }
  }

  render() {
    return <Segment className="page text-back account-list">
      {this.addSkype()}
      {this.accounts()}
      <Alert
        persist="addSkypeHelp"
        content="Добавьте свои аккаунты Skype, с которых Вы планируете рассылать сообщения
        и вести рекламную деятельность в интернете"/>
    </Segment>
  }
}
