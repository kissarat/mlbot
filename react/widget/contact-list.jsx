import React, {Component} from 'react'
import {toArray, defaults, debounce} from 'lodash'
import {Table, Dimmer, Loader} from 'semantic-ui-react'
import Contact from '../entity/contact.jsx'
import Paginator from './paginator.jsx'

export default class ContactList extends Component {
  state = {
    search: '',
    offset: 0,
    count: 0,
    contacts: [],
    busy: true,
    delay: 300
  }

  componentWillReceiveProps(props) {
    this.loadContacts()
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
    Contact.on('update', this.loadContacts)
  }

  componentWillUnmount() {
    Contact.removeEventListener('update', this.loadContacts)
  }

  loadContacts = async(busy) => {
    if (true === busy) {
      this.setState({busy: true})
    }
    const {count, contacts} = await Contact.search(
      this.props.account,
      this.props.status,
      this.state.search,
      this.state.offset,
    )
    this.setState({
      count,
      contacts,
      busy: !busy
    })
  }

  onSearch = e => {
    const search = e.target.value
    console.log(search)
    this.setState({search})
    this.loadContacts()
  }

  rows() {
    return this.state.contacts.map(function (c) {
      let name = c.login
      if (c.name && name !== c.name) {
        name += ` (${c.name})`
      }
      return <Table.Row key={c.id}>
        <Table.Cell>
          {name}
        </Table.Cell>
      </Table.Row>
    })
  }

  render() {
    return <div className="widget contact-list">
      <input
        type="search"
        value={this.state.text}
        onChange={this.onSearch}
      />
      <div className="table-container">
        <Dimmer active={!this.state.contacts} inverted>
          <Loader/>
        </Dimmer>
        <Table>
          <Table.Body>{this.rows()}</Table.Body>

          <Table.Footer>
            <Table.Row>
              <Table.HeaderCell>
                <Paginator
                  openPage={offset => this.setState({offset})}
                  {...this.state}/>
              </Table.HeaderCell>
            </Table.Row>
          </Table.Footer>
        </Table>
      </div>
    </div>
  }
}
