import React, {Component} from 'react'
import {omit} from 'lodash'

export default class Tabs extends Component {
  componentWillMount() {
    if (!this.state) {
      this.setState({active: this.props.children.find(a => a.props.active).key})
    }
  }

  componentWillReceiveProps(props) {
    if (this.props.active !== props.active) {
      this.setState({active: props.children.find(a => a.props.active).key})
    }
  }

  open(key) {
    this.setState({active: (this.props.children.find(a => a.key === key) || this.props.children[0]).key})
  }

  buttons(active) {
    const buttons = this.props.children.map(a =>
      <a className={active === a.key ? 'active item' : 'item'}
         key={a.key}
         onClick={() => this.open(a.key)}>{a.props.title}</a>)
    return <div className="ui menu top attached tabular">{buttons}</div>
  }

  render() {
    const active = this.props.children.find(a => this.state.active === a.key)
    return <div className="tabs">
      {this.buttons(active.key)}
      {active}
    </div>
  }
}

Tabs.Panel = function Panel(props) {
  const children = props.children
  props = omit(props, 'active', 'title', 'children')
  props.className = (props.className || '') + ' ui bottom attached active tab segment'
  return <div {...props}>{children}</div>
}
