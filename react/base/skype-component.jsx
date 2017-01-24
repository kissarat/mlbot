import React, {Component} from 'react'
import {hashHistory} from 'react-router'
import {toArray, defaults, isObject} from 'lodash'
import {Status} from '../../app/config'
import SelectAccount from '../app/select-account.jsx'
import Alert from '../widget/alert.jsx'

export default class SkypeComponent extends Component {
  state = {
    account: '',
    alert: false,
    busy: false
  }

  componentWillReceiveProps(props) {
    // this.registerStorage()
    this.setState(props.params)
  }

  changeAccount(account) {
    const name = this.constructor.name.toLowerCase()
    let url
    if (account && account.login !== this.state.account) {
      url = `/${name}/` + account.login
    }
    else if (!account) {
      url = '/' + name
    }
    if (url) {
      hashHistory.push(url)
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
