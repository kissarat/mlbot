import React, {Component} from 'react'
import {toArray, defaults, isObject} from 'lodash'
import {Status} from '../../app/config'
import SelectAccount from '../app/select-account.jsx'
import Alert from '../widget/alert.jsx'
import Persistent from '../util/persistence.jsx'
import Skype from '../skype/index.jsx'

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
    const alert = this.state.alert || {visible: false}
    return <Alert {...alert}/>
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
    const busy = 'busy' === alert.type
    if (busy) {
      alert.type = 'info'
    }
    // console.log(alert)
    this.setState({
      alert,
      busy
    })
  }

  setBusy(busy) {
    this.setState({busy})
  }
}
