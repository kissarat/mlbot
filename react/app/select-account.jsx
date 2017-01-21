import React, {Component} from 'react'
import {Select, Button} from 'semantic-ui-react'
import Skype from '../skype/index.jsx'
import {toArray} from 'lodash'

export default class SelectAccount extends Component {
  state = {
    accounts: [],
    buttonLoading: false
  }

  componentWillMount() {
    Skype.getAccountList(false)
      .then(accounts => this.setState({accounts}))
  }

  onChange = (e, {value}) => {
    Skype.getAccount(value).then(account => this.props.select(account))
  }

  options() {
    return this.state.accounts.map(account => ({
      value: account.login,
      text: account.login,
    }))
  }

  value() {
    return this.state.accounts.find(a => a.login === this.props.value)
      ? this.props.value : ''
  }

  openSkype = async login => {
    this.setState({buttonLoading: true})
    await Skype.open(login)
    this.setState({buttonLoading: false})
  }

  render() {
    const value = this.value()
    return <div className="widget select-account">
      <Select
        id="select-skype"
        name="account"
        onChange={this.onChange}
        options={this.options()}
        placeholder="Выберети Skype"
        value={value}
      />
      <Button
        loading={this.state.buttonLoading}
        className="login-skype"
        type="button"
        onClick={this.openSkype}
        icon="sign in"
        content="Вход в Skype"/>
    </div>
  }
}
