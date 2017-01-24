import Contact from '../entity/contact.jsx'
import Paginator from './paginator.jsx'
import React, {PureComponent, PropTypes} from 'react'
import {Status} from '../../app/config'
import {Table, Dimmer, Loader, Input, Icon} from 'semantic-ui-react'
import {toArray, defaults, debounce, pick, isEqual, isObject} from 'lodash'

export default class ContactList extends PureComponent {
  static propTypes = {
    condition: PropTypes.oneOfType([
      // PropTypes.func.isRequired,
      PropTypes.object.isRequired,
      PropTypes.bool.isRequired
    ]),
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
    console.log('props', props)
  }

  // shouldComponentUpdate(props, state) {
    // return !isEqual(this.props.queryName, props.queryName)
    // return true
  // }

  componentDidMount() {
    this.getQuery()
      .listen(this.listener)
      .request(pick(this.state, 'search', 'offset', 'limit'))
  }

  componentWillUnmount() {
    this.getQuery().listen(false)
  }

  getQuery() {
    return Contact.queries[this.props.queryName]
  }

  listener = state => {
    console.log(state)
    this.setState(state)
  }

  changeOffset = offset => {
    this.getQuery().request({offset})
  }

  async changeStatus({id, status}) {
    status = Status.CREATED === status ? Status.SELECTED : Status.CREATED
    await db.contact.update(id, {status})
  }

  onSearch = (e, {value}) => {
    this.getQuery().request({search: value})
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
