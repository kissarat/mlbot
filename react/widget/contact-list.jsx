import Contact from '../entity/contact.jsx'
import Paginator from './paginator.jsx'
import React, {PureComponent, PropTypes} from 'react'
import {Status} from '../../app/config'
import {Table, Dimmer, Loader, Input, Icon} from 'semantic-ui-react'
import {toArray, defaults, debounce, pick, isEqual, isObject} from 'lodash'

export default class ContactList extends PureComponent {
  static propTypes = {
    account: PropTypes.string,
    status: PropTypes.string,
    sort: PropTypes.string
  }

  state = {
    search: '',
    offset: 0,
    limit: 12,
    count: 0,
    contacts: [],
    loading: false
  }

  componentWillReceiveProps(props) {
    if (props.account && this.props.account !== props.account) {
      this.request({
        account: props.account,
        authorized: 1,
        status: props.status
      })
    }
  }

  getRelevantState(props) {
    const state = pick(this.state, 'search', 'offset', 'limit', 'count')
    return defaults(state, pick(props, 'account'))
  }

  componentDidMount() {
    const query = this.getQuery()
    query.listen(this.listener)
    if (!this.props.delivery || this.props.account) {
      query.request(this.getRelevantState(this.props))
    }
  }

  componentWillUnmount() {
    this.getQuery().listen(false)
  }

  getQuery() {
    return Contact.queries[this.props.query]
  }

  request(params) {
    return this.getQuery().request(params)
  }

  listener = state => {
    state.loading = false
    this.setState(state)
  }

  changeOffset = offset => {
    this.setState({loading: true})
    this.request({offset})
  }

  async changeStatus({id, status}) {
    status = Status.CREATED === status ? Status.SELECTED : Status.CREATED
    await db.contact.update(id, {status})
    return this.request()
  }

  onSearch = (e, {value}) => {
    this.request({
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
