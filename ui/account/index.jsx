import AccountManager from '../../account-manager/index.jsx'
import Alert from '../widget/alert.jsx'
import api from '../../connect/api.jsx'
import React, {Component} from 'react'
import {Link} from 'react-router'
import {Loader, Icon, Segment} from 'semantic-ui-react'
import db from '../../store/database.jsx'

export default class AccountList extends Component {
  state = {
    accounts: false,
  }

  async load(refresh = false) {
    const accounts = await AccountManager.getList(refresh)
    this.setState({accounts})
  }

  async componentDidMount() {
    await this.load()
    for (const account of this.state.accounts) {
      account.on('status', this.changeTime)
    }
  }

  componentWillUnmount() {
    for (const account of this.state.accounts) {
      account.removeListener('status', this.changeTime)
    }
  }

  changeTime = () => this.setState({time: Date.now()})

  async remove({id}) {
    await db.account.delete(id)
    await this.load(true)
  }

  addSkype() {
    if (this.state.accounts instanceof Array) {
      if (this.state.accounts.length >= 500) {
        return <Alert
            warning
            content="К сожалению в данной версии приложения вы не можете добавить больше 500 скайпов"/>
      }
      else {
        return <Link to="/accounts/login">Добавить Skype</Link>
      }
    }
  }

  async login(a) {
    if (a.status) {
      a.logout()
    }
    else {
      await a.login()
    }
    this.changeTime()
  }

  webSkype(a) {
    if (a.web) {
      let color = ['authenticated', 'contacts'].indexOf(a.status) >= 0 ? 'green' : 'grey'
      if ('skype' === a.status) {
        color = 'yellow'
      }
      return <Icon
          name="skype"
          size="large"
          color={color}
          onClick={() => this.login(a)}
          title={'skype' === a.status ? 'Вход в Web-версию Skype' : 'Используется Web-версия Skype'}/>
    }
  }

  accounts() {
    if (this.state.accounts instanceof Array) {
      const accounts = this.state.accounts.map(a => <tr key={a.id}>
        <td>{this.webSkype(a)}</td>
        <td>{a.id}</td>
        <td>
          <Link to={'/accounts/edit/' + a.id}><Icon name="edit"/></Link>
          <Icon name="remove" onClick={() => this.remove(a)}/>
        </td>
      </tr>)
      return <table>
        <tbody>{accounts}</tbody>
      </table>
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
