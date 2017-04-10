import Contact from '../../store/contact.jsx'
import ContactList from '../widget/contact-list.jsx'
import db from '../../store/database.jsx'
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Button, Select} from 'semantic-ui-react'
import {Status, Type} from '../../app/config'
import {toArray, defaults, keyBy, uniq, values} from 'lodash'

export default class DeliveryList extends Component {
  static propTypes = {
    type: PropTypes.oneOf(values(Type)).isRequired,
    account: PropTypes.string,
    authorized: PropTypes.oneOf([0, 1]).isRequired,
    disabled: PropTypes.bool,
    sort: PropTypes.string,
    status: PropTypes.oneOf([Status.NONE, Status.SELECTED]).isRequired,
  }

  state = {
    group: false,
    busy: false
  }

  componentDidMount() {
    void this.load(this.props)
  }

  componentWillReceiveProps(props) {
    if (this.props.account !== props.account || this.props.type !== props.type) {
      void this.load(props)
    }
  }

  async load(props) {
    if (Type.PERSON === props.type && Status.NONE === props.status) {
      const groups = [{id: '', text: 'Все группы'}].concat(
        await db.group.filter(g => props.account === g.account).toArray()
      )
      this.setState({
        group: this.state.group || '',
        groups: groups.map(g => ({key: g.id, value: g.id, text: g.name}))
      })
    }
    else {
      this.setState({group: false})
    }
  }

  changeStatusAll = async() => {
    if (this.props.account) {
      this.setState({busy: true})
      const where = {
        account: this.props.account,
        authorized: 1,
        status: this.props.status,
      }
      const mods = {
        status: Status.NONE === this.props.status ? Status.SELECTED : Status.NONE
      }
      const q = db.contact.where(where)
      if (this.state.group) {
        q.filter(c => Type.PERSON === c.type && c.groups.indexOf(this.state.group) >= 0)
      }
      await q.modify(mods)
      // console.log(where, this.state.group, mods)
      Contact.emit('update')
      this.setState({busy: false})
    }
  }

  className() {
    let className = (this.props.className || '') + ' delivery-list '
    className += this.props.status ? 'selected' : 'other'
    if (this.hasGroupSelection()) {
      className += ' select-group'
    }
    return className
  }

  onChange = (e, {value}) => {
    this.setState({group: value})
  }

  groupsSelect() {
    if (this.state.groups instanceof Array) {
      return <Select
        key="select"
        value={this.state.group || ''}
        options={this.state.groups}
        onChange={this.onChange}/>
    }
  }

  hasGroupSelection() {
    return this.state.groups && Type.PERSON === this.props.type && Status.NONE === this.props.status
  }

  controls() {
    const button = <Button
      key="button"
      disabled={!this.props.account}
      loading={this.state.busy}
      type="button"
      onClick={this.changeStatusAll}
      content={Status.SELECTED === this.props.status ? 'Никому' : 'Разослать всем'}
      title="Кому отправить сообщение?"/>

    if (this.hasGroupSelection()) {
      return <div className="button-and-group">
        {button}
        {this.groupsSelect()}
      </div>
    }
    else {
      return button
    }
  }

  render() {
    return <ContactList
      {...this.props}
      disabled={!this.props.account}
      className={this.className()}
      group={this.state.group}>
      {this.controls()}
    </ContactList>
  }
}
