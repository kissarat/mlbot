import React, {Component} from 'react'
import Skype from '../skype/index.jsx'
import stateStorage from '../util/state-storage.jsx'
import {hashHistory} from 'react-router'
import {toArray, defaults} from 'lodash'
import App from './index.jsx'

export default class SkypeComponent extends Component {
  getStorageName() {
    return this.constructor.name.toLocaleLowerCase()
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  componentWillUnmount() {
    stateStorage.unregister(this.getStorageName(), this.state)
  }

  componentDidUpdate(_1, prevState) {
    stateStorage.save(this.getStorageName(), this.state)
    if (prevState.busy != this.state.busy) {
      App.setState({busy: this.state.busy})
    }
  }

  getSkype() {
    return Skype.open(this.state.account)
  }

  changeAccount(account) {
    const name = this.getStorageName()
    if (account && account.login !== this.state.account) {
      hashHistory.push(`/${name}/` + account.login)
    }
    else if (!account) {
      hashHistory.push('/' + name)
    }
  }

  getMessage() {
    return this.state.alert ? <Message {...this.state.alert}/> : ''
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
    this.setState({
      alert,
      busy
    })
  }

  setBusy(busy) {
    this.setState({busy})
  }

  reset = () => this.setState(stateStorage.reset(this.getStorageName()))
}
