import Contact from '../entity/contact.jsx'
import Paginator from './paginator.jsx'
import React, {PureComponent, PropTypes} from 'react'
import {Status} from '../../app/config'
import {Table, Dimmer, Loader, Input, Icon} from 'semantic-ui-react'
import {toArray, defaults, debounce, pick, omit, isEqual, isObject, merge} from 'lodash'

export default class ContactList extends PureComponent {
  static propTypes = {
    account: PropTypes.string,
    authorized: React.PropTypes.oneOf([0, 1]).isRequired,
    disabled: PropTypes.bool,
    sort: PropTypes.string,
    status: React.PropTypes.oneOf([Status.CREATED, Status.SELECTED]).isRequired,
  }

  state = {
    search: '',
    offset: 0,
    limit: 12,
    count: 0,
    contacts: [],
    loading: false
  }

  constructor() {
    super()
    this.debounced = debounce(this.load, 300)
  }

  componentWillReceiveProps(props) {
    this.initialize(props)
  }

  componentDidMount() {
    Contact.on('update', this.update)
    this.initialize(this.props)
  }

  initialize(props) {
    if (!props.authorized || props.account) {
      const params = pick(props, 'account', 'status', 'authorized')
      defaults(params, pick(this.state, 'offset', 'limit'))
      this.setState({loading: true})
      this.load(params)
    }
  }

  componentWillUnmount() {
    Contact.removeListener('update', this.update)
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
    this[this.state.count > 600 ? 'debounced' : 'load']({
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
        name = name.slice(0, 48) + '…'
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
