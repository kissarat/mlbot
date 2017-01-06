import React, {Component} from 'react'
import Skype from './index'
import {Button, Form} from 'semantic-ui-react'
import {hashHistory} from 'react-router'

export default class SkypeLogin extends Component {
  state = {loading: false}

  onSubmit = (e, {formData}) => {
    e.preventDefault()
    this.setState({loading: true})
    Skype
      .open(formData)
      .getProfile()
      .then(() => {
        this.setState({loading: false})
        hashHistory.push('/messages')
      })
  }

  render() {
    return <Form onSubmit={this.onSubmit} loading={this.state.loading}>
      <h1>Вход в Skype</h1>
      <Form.Field name="login" label="Логин" control="input" type="text"/>
      <Form.Field name="password" label="Пароль" control="input" type="password"/>
      <Button type="submit">Вход</Button>
    </Form>
  }
}
