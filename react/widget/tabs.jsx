import React, {Component} from 'react'
import {omit} from 'lodash'

export default class Tabs extends Component {
  active(key, children) {
    const active = children.find(a => key === a.key) || children[0]
    this.setState({active: active.key})
  }

  componentWillMount() {
    this.active(this.props.active, this.props.children)
  }

  componentWillReceiveProps(props) {
    this.active(props.active, props.children)
  }

  open(key) {
    this.active(key, this.props.children)
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
