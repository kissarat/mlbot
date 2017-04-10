import React, {Component} from 'react'
import {Menu, Icon} from 'semantic-ui-react'
import {range} from 'lodash'

export default class Paginator extends Component {
  state = {}

  componentWillReceiveProps({offset, limit, count}) {
    const totalPages = Math.ceil(count / limit)
    let page = Math.floor(offset / limit) + 1
    // let left = Math.min(Math.max(page - 2, 1), Math.max(totalPages - 4, 1))
    // let right =  Math.max(Math.min(page + 2, totalPages), Math.min(totalPages, 5))
    const left = Math.max(Math.min(page - 2, totalPages - 4), 1)
    const right = Math.min(Math.max(page + 2, 5), totalPages)
    const numbers = range(left, right + 1)
    this.setState({
      page,
      numbers,
      totalPages
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
      onClick={() => this.open(n)}>
      {n}
    </Menu.Item>)
  }

  render() {
    const arrows = this.state.totalPages >= 5
    return <Menu pagination size="small" compact className="widget paginator">
      {arrows ? <Menu.Item onClick={() => this.open(1)}>
          <Icon
            name='left chevron'
            disabled={this.state.page < 2}/>
        </Menu.Item> : ''}
      {this.items()}
      <Menu.Item onClick={() => this.open(this.state.totalPages)}>
        <Icon
          name='right chevron'/>
      </Menu.Item>
      <Menu.Item as="strong">{this.props.count}</Menu.Item>
    </Menu>
  }
}
