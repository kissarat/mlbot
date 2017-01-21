import React, {Component} from 'react'
import api from '../connect/api.jsx'
import {defaults} from 'lodash'
import {Button, Form} from 'semantic-ui-react'
import {hashHistory} from 'react-router'
import Contact from '../entity/contact.jsx'
import db from '../database.jsx'
import Skype from '../skype/index.jsx'

export default class Settings extends Component {
  state = {
    contactsCount: false,
    accountsCount: false
  }

  componentWillReceiveProps(props) {
    this.countContacts()
    this.countAccounts()
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  async countContacts() {
    this.setState({contactsCount: await Contact.countAll()})
  }

  async countAccounts() {
    const accountList = await Skype.getAccountList(true)
    this.setState({accountsCount: accountList.length})
  }

  clearSettings = () => {
    localStorage.clear()
    hashHistory.push('/login')
  }

  clearContacts = () => {
    return db.reset()
  }

  clearAccounts = async() => {
    await api.del('skype/remove')
    this.countAccounts()
  }

  clearAll = async() => {
    await this.clearContacts()
    await this.clearAccounts()
    this.clearSettings()
  }

  dev() {
    return <div className="dev">
      <div className="import">
        <label htmlFor="import">Импорт</label>
        <input id="import" type="file"/>
      </div>
      <div className="export">
        <label htmlFor="export">Экспорт</label>
        <input id="export" type="file"/>
      </div>
    </div>
  }

  labelWithCount(label, name) {
    if ('number' === typeof this.state[name]) {
      label += ` (${this.state[name]})`
    }
    return label
  }

  clearContactsLabel = () => this.labelWithCount('Очистить копию списка контактов', 'contactsCount')
  clearAccountsLabel = () => this.labelWithCount('Очистить логины и пароли скайпов', 'accountsCount')

  render() {
    return <Form className="page settings">
      <div className="control">
        <Button onClick={this.clearSettings} type="button">Очистить настройки</Button>
        <Button onClick={this.clearContacts} type="button">{this.clearContactsLabel()}</Button>
        <Button onClick={this.clearAccounts} type="button">{this.clearAccountsLabel()}</Button>
        <Button onClick={this.clearAll} type="button">Очистить все</Button>
      </div>
      {isDevMode ? this.dev() : ''}
    </Form>
  }
}
