import Contact from '../entity/contact.jsx'
import Paginator from './paginator.jsx'
import React, {PureComponent, PropTypes} from 'react'
import {Status, dev} from '../../app/config'
import {Table, Dimmer, Loader, Input} from 'semantic-ui-react'
import {toArray, defaults, debounce, pick, omit, isEqual, isObject, merge} from 'lodash'

export default class ContactList extends PureComponent {
  static propTypes = {
    account: PropTypes.string,
    authorized: PropTypes.oneOf([0, 1]).isRequired,
    disabled: PropTypes.bool,
    sort: PropTypes.string,
    status: PropTypes.oneOf([Status.CREATED, Status.SELECTED]).isRequired,
  }

  state = {
    search: '',
    offset: 0,
    limit: 12,
    count: 0,
    contacts: [],
    loading: false,
    resized: false
  }

  constructor() {
    super()
    this.debounced = debounce(this.load, 300)
    this.resizeDebounced = debounce(this.resize, 300)
  }

  componentWillReceiveProps(props) {
    if (props.authorized) {
      this.initialize(props)
    }
  }

  // shouldComponentUpdate(props, state) {
  //   return !isEqual(this.state, state)
  // }

  componentDidMount() {
    Contact.on('update', this.update)
    addEventListener('resize', this.resizeDebounced)
    this.initialize(this.props)
  }

  setupDev(clear) {
    if (dev) {
      const self = clear ? null : this

      if (this.props.authorized) {
        if (this.props.status) {
          window.otherContacts = self
        }
        else if (this.props.status) {
          window.selectedContacts = self
        }
      }
      else {
        window.queueContacts = self
      }
    }
  }

  componentWillUnmount() {
    this.setupDev(true)
    removeEventListener('resize', this.resizeDebounced)
    Contact.removeListener('update', this.update)
  }

  componentDidUpdate() {
    if (!this.state.resized) {
      setTimeout(this.resize, 300)
      this.setState({resized: true})
    }
    this.setupDev(false)
  }

  initialize(props) {
    if (!props.authorized || props.account) {
      const params = pick(props, 'type', 'account', 'status', 'authorized')
      if (1 === props.online) {
        params.online = 1
      }
      defaults(params, pick(this.state, 'offset', 'limit'))
      if (this.props.account !== props.account) {
        params.offset = 0
      }
      this.setState({loading: true})
      this.load(params)
    }
  }

  update = () => {
    this.load(this.state)
  }

  async load(state) {
    defaults(state, this.state)
    const result = await Contact.request(state)
    defaults(result, state)
    result.loading = false
    this.setState(result)
  }

  softLoad(state) {
    this[this.state.count > 600 ? 'debounced' : 'load'](state)
  }

  resize = () => {
    const container = document.querySelector('.contact-list-segment')
    const table = document.querySelector('.contact-list .table-container table')
    const td = document.querySelector('.contact-list .table-container td')
    if (container && table && td) {
      const unit = td.getBoundingClientRect()
      const target = table.getBoundingClientRect()
      const box = container.getBoundingClientRect()
      const delta = Math.floor((box.height - target.height - 100) / unit.height)
      if (delta) {
        this.load({limit: this.state.limit + delta - 1})
        return true
      }
    }
  }

  changeOffset = offset => {
    this.load({
      loading: true,
      offset
    })
  }

  async changeStatus({id, status}) {
    status = Status.CREATED === status ? Status.SELECTED : Status.CREATED
    await db.contact.update(id, {status})
    Contact.emit('update')
  }

  onSearch = (e, {value}) => {
    this.softLoad({
      search: value,
      offset: 0
    })
  }

  rows() {
    return this.state.contacts.map(c => {
      let name = c.login
      if (c.name && name !== c.name) {
        name += ` (${c.name})`
      }
      if (name.length > 45) {
        name = name.slice(0, 45) + '…'
      }
      const isNew = Status.CREATED === c.status
      return <Table.Row
        key={c.id} className={isNew ? 'add' : 'remove'}
        onClick={() => this.changeStatus(c)}>
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
    return <div
      className={'widget contact-list ' + (this.props.className || '')}>
      <div className="control">
        <Input
          icon="search"
          disabled={this.props.disabled}
          onChange={this.onSearch}
          size="small"
          type="search"
          className="search"
        />
        {this.props.children}
      </div>
      <div className="table-container">
        <Dimmer active={this.state.loading} inverted>
          <Loader/>
        </Dimmer>
        <Table selectable className={this.state.count > 0 ? 'nothing' : 'hidden'}>
          <Table.Body>{this.rows()}</Table.Body>
          {this.footer()}
        </Table>
      </div>
    </div>
  }
}
