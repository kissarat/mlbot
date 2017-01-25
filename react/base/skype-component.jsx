import React, {Component} from 'react'
import {toArray, defaults, isObject} from 'lodash'
import {Status} from '../../app/config'
import SelectAccount from '../app/select-account.jsx'
import Alert from '../widget/alert.jsx'
import Persistent from '../util/persistence.jsx'
import Skype from '../skype/index.jsx'
import App from '../app/index.jsx'

export default class SkypeComponent extends Component {
  persist = ['account']

  constructor() {
    super()
    this.state = Persistent.register(this, {
      account: '',
      alert: false,
      busy: false
    })
  }

  componentDidMount() {
    if (this.state.account) {
      Skype.getAccount(this.state.account).then(account => {
        if (!account) {
          this.setState({account: ''})
        }
      })
    }
    window.delivery = this
  }

  changeAccount(account) {
    if (account.login) {
      this.setState({
        account: account.login
      })
    }
  }

  selectAccount() {
    return <SelectAccount
      value={this.state.account}
      select={account => this.changeAccount(account)}/>
  }

  alertMessage() {
    return this.state.alert ? <Alert {...this.state.alert}/> : ''
  }

  alert = (type, content) => {
    let alert
    if (!type) {
      alert = false
    }
    else if (isObject(type)) {
      alert = type
    }
    else {
      alert = {type, content}
    }
    let busy = 'busy' === type
    if (busy) {
      App.setBusy(content)
      alert = false
    }
    else {
      App.setBusy(false)
    }
    this.setState({alert})
  }
}
