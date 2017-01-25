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

  openSkype = async() => {
    this.setState({busy: true})
    await Skype.open(this.props.value)
    this.setState({busy: false})
  }

  loginButton(selectedAccount) {
    if (selectedAccount && Skype.get(selectedAccount)) {
      return <Button
        className="skype logout"
        content="Выйти"
        disabled={!selectedAccount}
        icon="sign out"
        onClick={() => Skype.all().remove()}
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
    return <div className="widget select-account">
      <Select
        id="select-skype"
        name="account"
        onChange={this.onChange}
        options={this.options()}
        placeholder="Выберите Skype"
        value={this.props.value}
      />
      {this.loginButton(this.props.value)}
    </div>
  }
}
