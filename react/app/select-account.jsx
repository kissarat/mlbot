import React, {Component} from 'react'
import {Select, Button} from 'semantic-ui-react'
import Skype from '../skype/index.jsx'
import {toArray} from 'lodash'

export default class SelectAccount extends Component {
  state = {
    accounts: [],
    busy: false
  }

  componentDidMount() {
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
    this.setState({busy: true})
    await Skype.open(this.value())
    this.setState({busy: false})
  }

  loginButton(selectedAccount) {
    if (Skype.dark.childElementCount) {
      return <Button
        className="skype logout"
        content="Выйти"
        disabled={!selectedAccount}
        icon="sign out"
        onClick={() => skype.remove()}
        type="button"
      />
    }
    else {
      return <Button
        className="skype logout"
        content="Войти"
        disabled={!selectedAccount}
        icon="sign in"
        loading={this.state.busy}
        onClick={this.openSkype}
        type="button"
      />
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
        placeholder="Выберите Skype"
        value={selectedAccount}
      />
      {this.loginButton(selectedAccount)}
    </div>
  }
}
