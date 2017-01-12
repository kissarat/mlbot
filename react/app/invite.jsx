import ContactList from './contact-list.jsx'
import db from '../database.jsx'
import React, {Component} from 'react'
import SelectAccount from './select-account.jsx'
import Skype from '../skype/index.jsx'
import {Form, Segment, Button, Input, Loader, Checkbox, Header} from 'semantic-ui-react'
import {hashHistory} from 'react-router'
import {seq} from '../util/index.jsx'
import stateStorage from '../util/state-storage.jsx'
import {Status} from '../../app/config'
import {toArray, defaults} from 'lodash'
import {filterSkypeUsernames, setImmediate} from '../util/index.jsx'

const INVITE_STORE_KEY = 'invite'

export default class Invite extends Component {
  componentWillReceiveProps(props) {
    let state = stateStorage.register(INVITE_STORE_KEY, ['text', 'limit', 'account'], {
      limit: 40,
      sort: false,
      account: '',
      invites: []
    })
    state = defaults(props.params, state)
    this.setState(state)
    setImmediate(() => this.loadContacts())
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  componentWillUnmount() {
    stateStorage.unregister(INVITE_STORE_KEY, this.state)
  }

  componentDidUpdate(props, state) {
    stateStorage.save(INVITE_STORE_KEY, this.state)
  }

  filterSkypeUsernames(text) {
    const accounts = filterSkypeUsernames(text)
    if (this.state.sort) {
      accounts.sort()
    }
    return accounts
  }

  changeAccount(account) {
    if (account && account.login !== this.state.account) {
      hashHistory.push('/invite/' + account.login)
    }
    else if (!account) {
      hashHistory.push('/invite')
    }
  }

  loadFromFile(file) {
    const reader = new FileReader()
    reader.onload = ({target: {result}}) => {
      this.setState({text: this.filterSkypeUsernames(result).join('\n')})
    }
    reader.readAsText(file)
  }

  limit = () => {
    const number = +this.state.limit
    if (number > 0) {
      const text = this.filterSkypeUsernames(this.state.text)
        .slice(0, number)
        .join('\n')
      this.setState({text})
    }
  }

  onChange = (e, d) => {
    let {name, value, checked} = d
    this.setState({[name]: value || checked})
    if ('sort' === name && checked) {
      setImmediate(() => {
        const text = this.filterSkypeUsernames(this.state.text).join('\n')
        this.setState({text})
      })
    }
  }

  onSubmit = async(e, {formData: {text}}) => {
    e.preventDefault()
    this.invite(this.filterSkypeUsernames(text))
  }

  async invite(usernames) {
    const account = this.state.account
    if (usernames.length > 0) {
      const existing = (
        await db.contact
          .filter(c => account === c.account)
          .toArray()
      )
        .map(c => c.login)
      usernames = usernames.filter(username => !existing.find(login => username === login))
      const invites = usernames.map(login => ({
        id: account + '~' + login,
        login,
        account,
        authorized: false,
        status: Status.SELECTED
      }))
      await db.contact.bulkAdd(invites)
    }
    return this.loadContacts()
  }

  async loadContacts() {
    const account = this.state.account
    const invites = await db.contact
      .filter(c => account === c.account && Status.SELECTED === c.status && !c.authorized)
      .toArray()
    this.setState({invites})
    return invites
  }

  render() {
    return <Segment.Group horizontal className="page invite">
      <Loader active={this.state.busy} size="medium"/>
      <Segment>
        <Form onSubmit={this.onSubmit}>
          <Form.Input
            name="file"
            type="file"
            onChange={e => this.loadFromFile(e.target.files[0])}/>
          <div className="limit" style={{display: this.state.text ? 'block' : 'none'}}>
            <Form.Field>
              <Checkbox
                name="sort"
                label="Сортировать логины по алфавиту"
                checked={this.state.sort}
                onChange={this.onChange}/>
            </Form.Field>
            <Form.Field>
              <Button type="button" onClick={this.limit}>Уменьшить</Button>
              и оставить первые
              <Input
                name="limit"
                type="number"
                value={this.state.limit}
                onChange={this.onChange}/>
              контактов
            </Form.Field>
          </div>
          <Form.TextArea
            name="text"
            placeholder="Здесь вы можете вставить список контактов"
            value={this.state.text}
            onChange={this.onChange}/>
          <div>
            <Button type="submit">Пригласить</Button>
            в аккаунт
            <SelectAccount
              value={this.state.account}
              select={account => this.changeAccount(account)}/>
          </div>
        </Form>
      </Segment>
      <Segment disabled={this.state.invites.length <= 0}>
        <Header as='h2'>Очередь приглашений</Header>
        <ContactList list={this.state.invites}/>
      </Segment>
    </Segment.Group>
  }
}
