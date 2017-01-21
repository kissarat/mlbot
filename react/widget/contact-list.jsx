import Contact from '../entity/contact.jsx'
import Paginator from './paginator.jsx'
import React, {Component} from 'react'
import {Status} from '../../app/config'
import {Table, Dimmer, Loader, Input, Icon} from 'semantic-ui-react'
import {toArray, defaults, debounce, pick} from 'lodash'

export default class ContactList extends Component {
  state = {
    search: '',
    offset: 0,
    count: 0,
    contacts: [],
    busy: true,
    delay: 300,
    limit: 10
  }

  componentWillReceiveProps(props) {
    this.loadContacts()
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
    Contact.on('update', this.loadContacts)
  }

  componentWillUnmount() {
    Contact.removeListener('update', this.loadContacts)
  }

  changeOffset = async offset => {
    await this.loadContacts()
    this.setState({offset})
  }

  loadContacts = async() => {
    this.setState({busy: true})
    let condition = pick(this.props, 'account', 'status', 'authorized')
    condition.authorized = condition.authorized ? 1 : 0
    const {count, contacts} = await Contact.search(
      condition,
      this.state.search,
      pick(this.state, 'offset', 'limit'),
    )
    this.setState({
      count,
      contacts,
      busy: false
    })
  }

  debounceSearch = debounce(() => this.loadContacts(), 300)

  onSearch = e => {
    const search = e.target.value
    this.setState({
      search,
      offset: 0
    })
    this.debounceSearch()
  }

  rows() {
    return this.state.contacts.map(c => {
      let name = c.login
      if (c.name && name !== c.name) {
        name += ` (${c.name})`
      }
      const isNew = Status.CREATED === c.status
      return <Table.Row
        key={c.id} className={isNew ? 'add' : 'remove'}
        onClick={() => this.props.changeStatus(c)}>
        <Table.Cell className="move">
          {name}
        </Table.Cell>
      </Table.Row>
    })
  }

  footer() {
    return <Table.Footer className={this.state.offset > this.state.limit ? 'nothing' : 'hidden'}>
      <Table.Row>
        <Table.HeaderCell>
          <Paginator
            changeOffset={this.changeOffset}
            {...this.state}/>
        </Table.HeaderCell>
      </Table.Row>
    </Table.Footer>
  }

  render() {
    return <div className="widget contact-list">
      <div className="control">
        <Input
          icon="search"
          onChange={this.onSearch}
          size="small"
          type="search"
          className="search"
          value={this.state.search}
        />
        {this.props.children}
      </div>
      <div className="table-container">
        <Dimmer active={this.state.busy || this.props.busy} inverted>
          <Loader/>
        </Dimmer>
        <Table selectable className={this.state.offset > 0 ? 'nothing' : 'hidden'}>
          <Table.Body>{this.rows()}</Table.Body>
          {this.footer()}
        </Table>
      </div>
    </div>
  }
}
