import App from '../app/index.jsx'
import Contact from '../../store/contact.jsx'
import fs from 'fs-promise'
import Paginator from './paginator.jsx'
import React, {PureComponent, PropTypes} from 'react'
import Skype from '../../skype/index.jsx'
import {filterSkypeUsernames} from '../../util/index.jsx'
import {remote} from 'electron'
import {Status, Type, dev} from '../../app/config'
import {Table, Dimmer, Loader, Input, Icon} from 'semantic-ui-react'
import {toArray, defaults, debounce, pick, omit, isEqual, isObject, merge} from 'lodash'

export default class ContactList extends PureComponent {
  static propTypes = {
    account: PropTypes.string,
    authorized: PropTypes.oneOf([0, 1]).isRequired,
    disabled: PropTypes.bool,
    // group: PropTypes.string,
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

  componentDidMount() {
    Contact.on('update', this.update)
    addEventListener('resize', this.resizeDebounced)
    this.initialize(this.props)
  }

  componentWillUnmount() {
    removeEventListener('resize', this.resizeDebounced)
    Contact.removeListener('update', this.update)
  }

  componentDidUpdate() {
    if (!this.state.resized) {
      setTimeout(this.resize, 300)
      this.setState({resized: true})
    }
  }

  initialize(props) {
    if (!props.authorized || props.account) {
      const params = pick(props, 'type', 'account', 'status', 'authorized')
      if (props.group) {
        params.group = props.group
      }
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

  update = () => this.load(this.state)

  async load(state) {
    if (!state.group) {
      this.state.group = false
    }
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
      const hasGroupSelection = Type.PERSON === this.props.type && Status.CREATED == this.props.status
      const delta = Math.floor((box.height - target.height - (hasGroupSelection ? 140 : 100)) / unit.height)
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

  async extractMembers(chatId, toFile) {
    const skype = await Skype.open(this.props.account, true)
    const {members} = await skype.getMembers(chatId)
    const usernames = []
    members.forEach(function (member) {
      const username = /8:(.*)/.exec(member.id)
      if (username) {
        usernames.push(username[1])
      }
    })
    if (toFile) {
      const data = filterSkypeUsernames(usernames).join('\n')
      remote.dialog.showSaveDialog(async path => {
        await fs.outputFile(path, data)
        App.setBusy(false)
      })
    }
    else {
      Contact.pushQueue(usernames)
      App.setBusy(false)
    }
  }

  actions(contact) {
    if (Type.CHAT === this.props.type) {
      return [
        <Table.Cell key="members" className="action">
          <Icon
            name="add user"
            size="large"
            title={`Добавить контакты из чата «${contact.name}» в очередь приглашений`}
            onClick={e => this.extractMembers(contact.login)}/>
        </Table.Cell>,
        <Table.Cell key="export" className="action">
          <Icon
            name="download"
            size="large"
            title={`Экспорт контактов из чата «${contact.name}»`}
            onClick={e => this.extractMembers(contact.login, true)}/>
        </Table.Cell>
      ]
    }
  }

  rows() {
    return this.state.contacts.map(c => {
      let name
      if (Type.PERSON === c.type) {
        name = c.login
        if (c.name && name !== c.name) {
          name += ` (${c.name})`
        }
      }
      else {
        name = c.name
      }
      const stringSize = Type.CHAT === c.type ? 38 : 45
      if (name.length > stringSize) {
        name = name.slice(0, stringSize) + '…'
      }
      const isNew = Status.CREATED === c.status
      return <Table.Row
        key={c.id} className={isNew ? 'add' : 'remove'}>
        <Table.Cell className="move" onClick={() => this.changeStatus(c)}>{name}</Table.Cell>
        {this.actions(c)}
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
