import api from '../connect/api.jsx'
import React, {Component} from 'react'
import {Button, Form, Grid, Image, Header, Icon} from 'semantic-ui-react'
import {hashHistory} from 'react-router'
import {shell} from 'electron'
import BrowserLink from '../widget/browser-link.jsx'

export default class Login extends Component {
  state = {loading: false}

  onSubmit = (e, {formData}) => {
    e.preventDefault()
    this.setState({loading: true})
    api.send('user/login/' + formData.email, formData)
      .then((data) => {
        if (data.success) {
          this.setState({loading: false})
          hashHistory.push('/accounts')
        }
      })
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
          <Form onSubmit={this.onSubmit} loading={this.state.loading}>
            <Form.Field name="email" placeholder="Введите Email" control="input" type="text"/>
            <Form.Field name="password" placeholder="Введите Пароль" control="input" type="password"/>
            <Button type="submit">Вход</Button>
          </Form>
        </Grid.Column>
        <Grid.Column>
          <Header as="h2">Как пользоваться?</Header>
          <div>
            <p>
              Для входа в программу MLBot Skype используйте почту и пароль проекта&nbsp;
              <BrowserLink href="https://club-leader.com/">club-leader.com</BrowserLink>.
            </p>
            <p>
              MLBot заработает при наличии открытой матрицы Silver в самом прибыльном
              матричном проекте 2017 года Club Leader.
            </p>
          </div>
          <BrowserLink href="http://mlbot.inbisoft.com/">
            <Icon name="question circle" size="large"/> Описание программы
          </BrowserLink>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  }
}
