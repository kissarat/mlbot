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

  openSkype = async() => {
    this.setState({buttonLoading: true})
    await Skype.open(this.value())
    this.setState({buttonLoading: false})
  }

  loginButton(selectedAccount) {
    const skype = Skype.get(selectedAccount)
    if (skype) {
      return <Button
        className="skype logout"
        type="button"
        onClick={() => skype.remove()}
        icon="sign out"
        content="Выйти из Skype"/>
    }
    else {
      return <Button
        loading={this.state.buttonLoading}
        className="skype logout"
        type="button"
        onClick={this.openSkype}
        icon="sign in"
        content="Войти в Skype"/>
    }
  }

  render() {
    const selectedAccount = this.value()
    return <div className="widget select-account">
      <Select
        id="select-skype"
        name="account"
        onChange={this.onChange}
        options={this.options()}
        placeholder="Выберети Skype"
        value={selectedAccount}
      />
      {this.loginButton(selectedAccount)}
    </div>
  }
}
