import React, {Component} from 'react'
import {List} from 'semantic-ui-react'

export default class ContactList extends Component {
  render() {
    const items = this.props.items.map(c => {
      let name = c.login
      if (c.name && name !== c.name) {
        name += ` (${c.name})`
      }
      return <List.Item key={c.id} onClick={() => this.props.select(c)}>{name}</List.Item>
    })

    return <List className="scroll">{items}</List>
  }
}
