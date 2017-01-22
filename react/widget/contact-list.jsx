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
    contacts: false,
    busy: true,
    delay: 300,
    limit: 10
  }

  componentWillReceiveProps(props) {
    this.setState({busy: props.busy})
    this.loadContacts(true)
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
    Contact.on('update', this.loadContacts)
    addEventListener('resize', this.resize)
  }

  componentWillUnmount() {
    removeEventListener('resize', this.resize)
    Contact.removeListener('update', this.loadContacts)
  }

  changeOffset = async offset => {
    await this.loadContacts(true)
    this.setState({offset})
  }

  resize = debounce(() => {
      const container = document.querySelector('.contact-list-segment')
      const table = document.querySelector('.contact-list .table-container table')
      const td = document.querySelector('.contact-list .table-container td')
      if (container && table && td) {
        const unit = td.getBoundingClientRect()
        const target = table.getBoundingClientRect()
        const box = container.getBoundingClientRect()
        const delta = Math.floor((box.height - target.height - 100) / unit.height)
        if (delta) {
          this.setState({limit: this.state.limit + delta})
          setImmediate(() => this.loadContacts(false))
        }
      }
    },
    300)

  loadContacts = async(busy = false) => {
    if (busy) {
      this.setState({busy})
    }
    let condition = pick(this.props, 'account', 'status', 'authorized')
    condition.authorized = condition.authorized ? 1 : 0
    const {count, contacts} = await Contact.search(
      condition,
      this.state.search,
      pick(this.state, 'offset', 'limit'),
    )

    if (false === this.state.contacts) {
        setImmediate(this.resize)
    }

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
    return <Table.Footer className={this.state.count > this.state.limit ? 'nothing' : 'hidden'}>
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
        <Dimmer active={this.state.busy} inverted>
          <Loader/>
        </Dimmer>
        <Table selectable className={this.state.count > 0 ? 'nothing' : 'hidden'}>
          <Table.Body>{this.state.contacts ? this.rows() : ''}</Table.Body>
          {this.footer()}
        </Table>
      </div>
    </div>
  }
}
