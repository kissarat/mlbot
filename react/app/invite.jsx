import ContactList from './contact-list.jsx'
import db from '../database.jsx'
import React, {Component} from 'react'
import SelectAccount from './select-account.jsx'
import Skype from '../skype/index.jsx'
import {Form, Segment, Button, List, Loader, Checkbox, Dimmer} from 'semantic-ui-react'
import {hashHistory} from 'react-router'
import {seq} from '../util/index.jsx'
import {Status} from '../../app/config'
import {toArray} from 'lodash'
import {filterSkypeUsernames, setImmediate} from '../util/index.jsx'

const INVITE_LIST_KEY = 'invite'

export default class Invite extends Component {
  state = {
    text: localStorage.getItem(INVITE_LIST_KEY) || '',
    limit: 40,
    sort: false,
    account: ''
  }

  componentWillReceiveProps(props) {
    if (props.params && props.params.account) {
      this.setState({account: props.params.account})
    }
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  componentWillUnmount() {
    localStorage.setItem(INVITE_LIST_KEY, this.state.text)
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
  }

  render() {
    return <div className="page invite">
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
              <input
                name="limit"
                type="number"
                size="3"
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
    </div>
  }
}
