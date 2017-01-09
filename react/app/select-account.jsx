import React, {Component} from 'react'
import {Select} from 'semantic-ui-react'
import Skype from '../skype/index.jsx'
import {toArray} from 'lodash'

export default class SelectAccount extends Component {
  state = {
    accounts: []
  }

  componentWillMount() {
    Skype.getAccountList(false)
      .then(accounts => this.setState({accounts}))
  }

  onChange = (e, {value}) => {
    Skype.getAccount(value).then(account => this.props.select(account))
  }

  render() {
    const options = this.state.accounts.map(account => ({
      value: account.login,
      text: account.login,
    }))
    return <Select
      placeholder="Выберети аккаунт"
      options={options}
      value={this.props.value}
      onChange={this.onChange}
    />
  }
}
