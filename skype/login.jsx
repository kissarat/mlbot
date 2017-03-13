import AccountManager from '../account-manager/index.jsx'
import Alert from '../ui/widget/alert.jsx'
import FormComponent from '../ui/base/form-component.jsx'
import React, {Component} from 'react'
import {Button, Form, Segment, Header, Icon} from 'semantic-ui-react'
import {hashHistory} from 'react-router'
import {Link} from 'react-router'
import {pick} from 'lodash'

export default class SkypeLogin extends FormComponent {
  state = {busy: false}

  onSubmit = async e => {
    e.preventDefault()
    let error = false
    this.setState({busy: true})
    try {
      await AccountManager.login(pick(this.state, 'login', 'password'))
      return void hashHistory.push('/accounts')
    }
    catch (err) {
      console.error(err)
      if ('username' === err.kind || 'password' === err.kind) {
        error = 'Неверный логин или пароль'
      }
      else if ('confirm' === err.kind) {
        error = `Ваш Skype-аккаунт нуждается в проверке.
          Откройте ваше Skype-приложения и подтвердите его с помощью email или SMS`
      }
      else {
        error = 'Неизвестная ошибка'
      }
    }
    this.setState({
      error,
      busy: false
    })
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
      <Form onSubmit={this.onSubmit} error={!!this.state.error} loading={this.busy}>
        {this.state.error ? <Alert error content={this.state.error}/> : ''}
        <Form.Field
          name="login" placeholder="Введите логин Skype" control="input" type="text"
          onChange={this.onChange}/>
        <Form.Field
          name="password" placeholder="Введите пароль Skype" control="input" type="password"
          onChange={this.onChange}/>
        <Button type="submit">Добавить</Button>
      </Form>
    </Segment>
  }
}
