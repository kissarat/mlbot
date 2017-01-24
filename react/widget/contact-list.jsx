import Contact from '../entity/contact.jsx'
import Paginator from './paginator.jsx'
import React, {Component, PropTypes} from 'react'
import {Status} from '../../app/config'
import {Table, Dimmer, Loader, Input, Icon} from 'semantic-ui-react'
import {toArray, defaults, debounce, pick, isEqual, isObject} from 'lodash'

export default class ContactList extends Component {
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
    count: 0,
    contacts: false,
    busy: true,
    delay: 300,
    limit: 12,
    sort: false,
    dynamicResize: false,
    condition: false,
    loading: false
  }

  componentWillReceiveProps(props) {
    if (!isEqual(this.state.condition, props.condition)) {
      console.log(this.state.condition, props.condition)
      setImmediate(() => this.load(true))
      this.setState({props})
    }
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
    Contact.on('update', this.load)
    if (this.state.dynamicResize) {
      addEventListener('resize', this.resize)
    }
  }

  componentWillUnmount() {
    if (this.state.dynamicResize) {
      removeEventListener('resize', this.resize)
    }
    Contact.removeListener('update', this.load)
  }

  changeOffset = offset => {
    this.setState({offset})
    this.load(true)
  }

  async changeStatus({id, status}) {
    status = Status.CREATED === status ? Status.SELECTED : Status.CREATED
    await db.contact.update(id, {status})
    this.load(false)
  }

  immediate = async() => {
    if (this.state.condition) {
      try {
        const start = Date.now()
        const {count, contacts} = await Contact.search(
          this.state.condition,
          this.state.search,
          pick(this.state, 'offset', 'limit', 'sort'),
        )

        // if (count > 0 && false === this.state.contacts) {
        //   setImmediate(this.resize)
        // }

        console.log(`ContactList ${contacts.length} of ${count} until ${Date.now() - start}`, this.state.condition)

        // if (this.state.count !== count) {
        //   this.props.countChanged(count)
        // }

        this.setState({
          count,
          contacts: count > 0 ? contacts : false,
          busy: false,
          loading: false
        })
      }
      catch (ex) {
        console.error(this.state.condition, ex)
      }
    }
  }

  debounced = debounce(() => this.state.condition && this.immediate(), 300)

  load = loading => {
    this.setState({loading: this.state.condition && (this.state.loading || true === loading || false)})
    this.immediate()
    // if (this.state.busy) {
    //   this.debounced()
    // }
    // else {
    //   setImmediate(this.immediate)
    // }
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
          this.load()
        }
      }
    },
    300)

  onSearch = e => {
    const search = e.target.value
    this.setState({
      search,
      offset: 0
    })
    this.load()
  }

  rows() {
    if (this.state.condition && this.state.contacts) {
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

  getAccount() {
    return !isObject(this.state.condition) || this.state.condition.account
  }

  render() {
    return <div
      className={'widget contact-list ' + (this.props.className || '')}
      data-account={this.getAccount() || ''}>
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
