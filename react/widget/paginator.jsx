import React, {Component} from 'react'
import {Menu, Icon} from 'semantic-ui-react'
import {range} from 'lodash'

export default class Paginator extends Component {
  componentWillReceiveProps({offset, limit, count}) {
    const totalPages = Math.ceil(count / limit)
    const page = Math.ceil(offset / limit)
    const numbers = range(Math.max(page - 2, 1), Math.min(page + 3, totalPages))
    // const numbers = range(page - 2, page + 3)
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
    this.props.changeOffset(n * this.props.limit)
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
          disabled={this.state.page < 1}/>
      </Menu.Item>
      {this.items()}
      <Menu.Item as='a' icon>
        <Icon
          name='right chevron'
          onClick={() => this.open(this.state.totalPages - 2)}
          disabled={this.state.totalPages < 5}/>
      </Menu.Item>
    </Menu>
  }
}
