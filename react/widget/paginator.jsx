import React, {Component} from 'react'
import {Menu, Icon} from 'semantic-ui-react'

export class Paginator extends Component {
  componentWillReceiveProps({offset, limit, count}) {
    const tail = Math.floor((count - offset) / limit)
    const page = Math.floor(offset / limit) + 1
    const numbers = range(page, page + (tail > 5 ? 5 : tail))
    this.setState({
      page,
      numbers,
      tail
    })
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  open(n) {
    this.props.openPage((n - 1) * this.props.limit)
  }

  items() {
    return this.state.numbers.map(n => <Menu.Item
      onClick={() => this.open(n)}
      as='a'>
      {n}
    </Menu.Item>)
  }

  render() {
    return <Menu className="widget page-nav">
      <Menu.Item as='a' icon>
        <Icon name='left chevron'/>
      </Menu.Item>
      {this.items()}
      <Menu.Item as='a' icon>
        <Icon name='right chevron'/>
      </Menu.Item>
    </Menu>
  }
}
