import Alert from '../widget/alert.jsx'
import App from '../app/index.jsx'
import Persistent from '../../util/persistence.jsx'
import React, {Component} from 'react'
import SelectAccount from '../account/select.jsx'
import AccountManager from '../../account-manager/index.jsx'
import {Status} from '../../app/config'
import {toArray, merge, defaults, isObject} from 'lodash'

export default class SkypeComponent extends Component {
  persist = ['account']

  componentWillMount() {
    this.setup()
  }

  setup(state) {
    this.setState(Persistent.register(this, merge({
      account: '',
      alert: false,
      busy: false
    }, state)))
  }

  componentDidMount() {
    void this.checkSkype()
  }

  async checkSkype() {
    if (this.state.account && !await AccountManager.get(this.state.account)) {
      this.setState({account: ''})
    }
  }

  changeAccount(account) {
    if (account.id) {
      this.setState({
        account: account.id
      })
    }
  }

  accountSelect(refresh) {
    return <SelectAccount
      value={this.state.account}
      select={account => this.changeAccount(account)}
      refresh={refresh}/>
  }

  alertMessage() {
    return this.state.alert ? <Alert
        {...this.state.alert}
        onDismiss={() => this.setState({alert: false})}/> : ''
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
      alert = {[type]: true, content}
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
