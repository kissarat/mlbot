import React, {Component} from 'react'
import Skype from './index.jsx'
import {Button, Form, Segment, Header, Icon} from 'semantic-ui-react'
import {hashHistory} from 'react-router'
import {Link} from 'react-router'

export default class SkypeLogin extends Component {
  state = {loading: false}

  onSubmit = (e, {formData}) => {
    e.preventDefault()
    this.setState({loading: true})
    Skype
      .open(formData)
      .then(() => {
        this.setState({loading: false})
        hashHistory.push('/accounts')
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
      <Form onSubmit={this.onSubmit} loading={this.state.loading}>
        <Form.Field name="login" placeholder="Введите логин Skype" control="input" type="text"/>
        <Form.Field name="password" placeholder="Введите пароль Skype" control="input" type="password"/>
        <Button type="submit">Добавить</Button>
      </Form>
    </Segment>
  }
}
