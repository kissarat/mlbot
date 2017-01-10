import api from '../connect/api.jsx'
import React, {Component} from 'react'
import {Button, Form} from 'semantic-ui-react'
import {hashHistory} from 'react-router'

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
    return <Form onSubmit={this.onSubmit} loading={this.state.loading}>
      <Form.Field name="email" label="Email" control="input" type="text"/>
      <Form.Field name="password" label="Пароль" control="input" type="password"/>
      <Button type="submit">Вход</Button>
    </Form>
  }
}
