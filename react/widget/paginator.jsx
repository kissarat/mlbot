import React, {Component} from 'react'
import {Menu, Icon} from 'semantic-ui-react'
import {range} from 'lodash'

export default class Paginator extends Component {
  componentWillReceiveProps({offset, limit, count}) {
    const tail = Math.floor((count - offset) / limit)
    const page = Math.floor(offset / limit) + 1
    const left = Math.max(page - 2, 1)
    const numbers = range(left, left + (tail > 5 ? 5 : tail))
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
    this.props.changeOffset((n - 1) * this.props.limit)
  }

  items() {
    return this.state.numbers.map(n => <Menu.Item
      active={n === this.state.page}
      key={n}
      onClick={() => this.open(n)}
      as='a'>
      {n}
    </Menu.Item>)
  }

  render() {
    return <Menu className="widget paginator">
      <Menu.Item as='a' icon>
        <Icon
          name='left chevron'
          onClick={() => this.open(1)}
          disabled={this.state.page >= 0}/>
      </Menu.Item>
      {this.items()}
      <Menu.Item as='a' icon>
        <Icon
          name='right chevron'
          onClick={() => this.open(1500)}
          disabled={this.state.tail >= 3}/>
      </Menu.Item>
    </Menu>
  }
}
