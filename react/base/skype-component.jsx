import Alert from '../widget/alert.jsx'
import ContactList from '../widget/contact-list.jsx'
import React, {Component} from 'react'
import stateStorage from '../util/state-storage.jsx'
import {hashHistory} from 'react-router'
import {toArray, defaults} from 'lodash'
import {Status} from '../../app/config'

export default class SkypeComponent extends Component {
  state = {
    account: false,
    alert: false,
    busy: false
  }

  componentWillReceiveProps(props) {
    this.setState(props.params)
  }

  changeAccount(account) {
    const name = this.getStorageName().toLowerCase()
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

  getAlert() {
    return this.state.alert ? <Alert {...this.state.alert}/> : ''
  }

  skypeUnavailable(skype) {
    this.alert('error', `Skype не отвечает в течении ${Math.round(skypeTimeout / 1000)} секунд`)
    skype.remove()
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

  reset = () => this.setState(stateStorage.reset(this.getStorageName()))

  list(props) {
    return <ContactList
      {...props}
    />
  }
}
