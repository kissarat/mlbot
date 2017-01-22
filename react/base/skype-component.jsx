import Alert from '../widget/alert.jsx'
import App from '../app/index.jsx'
import Contact from '../entity/contact.jsx'
import ContactList from '../widget/contact-list.jsx'
import Persistent from '../util/persistent.jsx'
import React, {Component} from 'react'
import Skype from '../skype/index.jsx'
import stateStorage from '../util/state-storage.jsx'
import Timeout from '../util/timeout.jsx'
import {hashHistory} from 'react-router'
import {mix} from '../util/index.jsx'
import {toArray, defaults} from 'lodash'
import {Status} from '../../app/config'

export default class SkypeComponent extends Component {
  constructor() {
    super()
    mix(this,
      Persistent,
      Timeout,
    )
    this.timeoutDuration = skypeTimeout
  }

  componentWillReceiveProps(props) {
    this.loadState(props.params)
  }

  componentWillMount() {
    this.loadState(this.props.params)
  }

  componentDidUpdate(_1, prevState) {
    this.saveStorage()
    if (prevState.busy != this.state.busy) {
      App.setBusy(this.state.busy)
    }
  }

  getSkype(busy) {
    return Skype.open(this.state.account, busy)
      // .catch(err => this.alert('error', errorMessage(err)))
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
    // console.log(url)
  }

  getMessage() {
    return this.state.alert ? <Alert {...this.state.alert}/> : ''
  }

  skypeUnavailable(skype) {
    this.alert('error', `Skype не отвечает в течении ${Math.round(skypeTimeout / 1000)} секунд`)
    skype.remove()
  }

  async openSkype() {
    if (this.state.account) {
      this.alert('warning', 'Вход в скайп')
      await this.getSkype()
      this.loadContacts()
      this.alert(false)
    }
    else {
      this.alert('warning', 'Выберете, пожалуйста, Skype')
    }
  }

  async loadContacts() {
    throw new Error('queryContacts is unimplemented')
  }

  alert(type, content) {
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

  async changeStatus({id, status}) {
    status = Status.CREATED === status ? Status.SELECTED : Status.CREATED
    await db.contact.update(id, {status})
    Contact.emit('update')
  }

  list(condition) {
    if (this.state.account) {
      condition.account = this.state.account
      return <ContactList
        {...condition}
        changeStatus={this.changeStatus}
      />
    }
    else {
      return ''
    }
  }
}
