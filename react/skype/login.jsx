import Alert from '../widget/alert.jsx'
import App from '../app/index.jsx'
import AccountManager from '../../account-manager/index.jsx'
import React, {Component} from 'react'
import {Button, Form, Segment, Header, Icon} from 'semantic-ui-react'
import {hashHistory} from 'react-router'
import {Link} from 'react-router'

export default class SkypeLogin extends Component {
  state = {loading: false}

  onSubmit = async(e, {formData}) => {
    e.preventDefault()
    try {
      formData.busy = true
      await AccountManager.login(formData)
      App.setBusy(false)
      this.setState({
        error: false
      })
      hashHistory.push('/accounts')
    }
    catch (err) {
      console.error(err)
      App.setBusy(false)
      if ('username' === err.kind || 'password' === err.kind) {
        this.setState({error: 'Неверный логин или пароль'})
      }
      else if ('confirm' === err.kind) {
        this.setState({
          error: `Ваш Skype-аккаунт нуждается в проверке.
          Откройте ваше Skype-приложения и подтвердите его с помощью email или SMS`
        })
      }
      else {
        this.setState({error: 'Неизвестная ошибка'})
      }
    }
    Skype.removeAll()
  }

  render() {
    return <Segment className="page skype-login">
      <div className="top">
        <Header as="h1">Вход в Skype</Header>
        <Link className="back" to="/accounts">
          <Icon name="chevron circle left" size="large"/>
          Вернуться к списку аккаунтов
        </Link>
      </div>
      <Form onSubmit={this.onSubmit} error={!!this.state.error}>
        {this.state.error ? <Alert error content={this.state.error}/> : ''}
        <Form.Field name="login" placeholder="Введите логин Skype" control="input" type="text"/>
        <Form.Field name="password" placeholder="Введите пароль Skype" control="input" type="password"/>
        <Button type="submit">Добавить</Button>
      </Form>
    </Segment>
  }
}
