import api from '../../connect/api.jsx'
import BrowserLink from '../widget/browser-link.jsx'
import config from '../../app/config'
import FormComponent from '../base/form-component.jsx'
import Invalid from '../page/invalid.jsx'
import React, {Component} from 'react'
import {Button, Form, Grid, Image, Header, Icon, Message} from 'semantic-ui-react'
import {hashHistory} from 'react-router'
import {pick} from 'lodash'

export default class Login extends FormComponent {
  persist = ['email']
  state = {
    loading: false
  }

  async submit() {
    // const = {
    //
    // }
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
      const {success, status, error} = await api.send('user/login', pick(this.state, 'email', 'password'))
      if (409 === status) {
        Invalid.render()
      }
      else {
        let alert = false
        if (success) {
          hashHistory.push('/accounts')
        }
        else {
          if ('ABSENT' === error.status) {
            alert = 'Неверные email или пароль'
          }
          else if ('ALERT' === error.status) {
            alert = error.message
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
    }
  }

  getMessage() {
    return this.state.alert ? <Message error>{this.state.alert}</Message> : ''
  }

  descriptionLink(url) {
    return <BrowserLink href={url}>
      <Icon name="question circle" size="large"/> Описание программы
    </BrowserLink>
  }

  howToUse() {
    switch (config.vendor) {
      case 'club-leader':
        return <Grid.Column>
          <Header as="h2">Как пользоваться?</Header>
          <div>
            <p>
              Для входа в программу MLBot Skype используйте почту и пароль проекта&nbsp;
              <BrowserLink href="https://club-leader.com/">club-leader.com</BrowserLink>
            </p>
            <p>
              MLBot заработает при наличии открытой матрицы Silver в самом прибыльном
              матричном проекте 2017 года Club Leader.
            </p>
          </div>
          {this.descriptionLink('http://mlbot.inbisoft.com/')}
        </Grid.Column>

      case 'inbisoft':
        return <Grid.Column>
          <Header as="h2">Как пользоваться?</Header>
          <div>
            <p>
              Восстановить пароль вы можете на сайте&nbsp;
              <BrowserLink href="https://my.inbisoft.com/">my.inbisoft.com</BrowserLink>
            </p>
            <Message className="buy">
              <Icon name="dollar" size="big"/>
              <p>
                Для использования программы необходимо приобрести лицензию за $22 у разработчика на сайте&nbsp;
                <BrowserLink href="https://my.inbisoft.com/">my.inbisoft.com</BrowserLink>&nbsp;
                и войти под Email/Пароль от личного кабинета.
              </p>
            </Message>
          </div>
          {this.descriptionLink('https://inbisoft.com/mlbot/')}
        </Grid.Column>

      case 'lsproject':
        return <Grid.Column>
          <Header as="h2">Команда L&S Project</Header>
          <div>
            <p>Уверенный взгляд в красивое будущее!</p>
            <p>Наш сайт: <BrowserLink href="https://lsproject.net">lsproject.net</BrowserLink></p>
            <br/>
            <BrowserLink href="skype:live:evl01051970?chat">
              <Icon name="skype" size="large"/>
              Скайп администрации
            </BrowserLink>
          </div>
          {this.descriptionLink('https://inbisoft.com/mlbot/')}
        </Grid.Column>
    }
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
        {this.howToUse()}
      </Grid.Row>
    </Grid>
  }
}
