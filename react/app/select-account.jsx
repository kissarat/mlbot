import React, {Component} from 'react'
import {Select, Button, Icon} from 'semantic-ui-react'
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
    return <Icon
      name="refresh"
      loading={this.state.busy}
      size="big"
      title="Обновить список контактов"
      disabled={!selectedAccount}
      onClick={this.openSkype}/>
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
      {this.props.login ? this.loginButton(this.props.value) : ''}
    </div>
  }
}
