import api from '../../connect/api.jsx'
import BrowserLink from '../widget/browser-link.jsx'
import config from '../../app/config'
import Invalid from '../page/invalid.jsx'
import React, {Component} from 'react'
import {Button, Form, Grid, Image, Header, Icon, Message} from 'semantic-ui-react'
import {hashHistory} from 'react-router'
import {pick} from 'lodash'
import FormComponent from '../base/form-component.jsx'

export default class Login extends FormComponent {
  persist = ['email']
  state = {
    loading: false
  }

  onSubmit = e => {
    e.preventDefault()
    if (this.state.email.length < 3) {
      this.setState({alert: 'Введите Email'})
    }
    else if (this.state.password.length < 3) {
      this.setState({alert: 'Введите пароль'})
    }
    else {
      this.setState({
        loading: true,
        alert: false
      })
      api.send('user/login', pick(this.state, 'email', 'password'))
        .then((data) => {
          if (409 === data.status) {
            Invalid.render()
          }
          else {
            let alert = false
            if (data.success) {
              hashHistory.push('/accounts')
            }
            else {
              if ('ABSENT' === data.error.status) {
                alert = 'Неверные логин или пароль'
              }
              else if ('ALERT' === data.error.status) {
                alert = data.error.message
              }
              else {
                alert = 'Неизвестная ошибка'
              }
            }
            this.setState({
              alert,
              loading: false,
            })
          }
        })
    }
  }

  getMessage() {
    return this.state.alert ? <Message error>{this.state.alert}</Message> : ''
  }

  render() {
    return <Grid className="page login">
      <Grid.Row columns={1}>
        <Grid.Column>
          <Image src="images/logo.png"/>
        </Grid.Column>
      </Grid.Row>
      <Grid.Row columns={2}>
        <Grid.Column>
          <Header as="h2">Вход</Header>
          {this.getMessage()}
          <Form onSubmit={this.onSubmit} loading={this.state.loading}>
            <Form.Field
              name="email"
              placeholder="Введите Email"
              control="input"
              type="text"
              onChange={this.onChange}/>
            <Form.Field
              name="password"
              control="input"
              placeholder="Введите Пароль"
              type="password"
              onChange={this.onChange}/>
            <Button type="submit">
              Вход
            </Button>
          </Form>
        </Grid.Column>
        <Grid.Column>
          <Header as="h2">Как пользоваться?</Header>
          <div>
            {'club-leader' === config.vendor ?
              <p>
                Для входа в программу MLBot Skype используйте почту и пароль проекта&nbsp;
                <BrowserLink href="https://club-leader.com/">club-leader.com</BrowserLink>
              </p>
              : <p>
                Восстановить пароль вы можете на сайте&nbsp;
                <BrowserLink href="http://my.inbisoft.com/password/recovery">my.inbisoft.com</BrowserLink>
              </p>}
            {'club-leader' === config.vendor ? <p>
                MLBot заработает при наличии открытой матрицы Silver в самом прибыльном
                матричном проекте 2017 года Club Leader.
              </p> : ''}
          </div>
          <BrowserLink
            href={'club-leader' === config.vendor ? "http://mlbot.inbisoft.com/" : "http://inbisoft.com/mlbot/"}>
            <Icon name="question circle" size="large"/> Описание программы
          </BrowserLink>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  }
}
