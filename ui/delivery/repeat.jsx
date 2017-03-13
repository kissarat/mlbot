import React, {Component} from 'react'

const state = {
  repeat: 1
}

export default class Repeat extends Component {
  static state = state
  state = state

  onChange = e => {
    const name = e.target.getAttribute('name')
    let value = +e.target.value
    if ('repeat' === name && value < 1) {
      value = 1
    }
    else if (value < 0) {
      value = 0
    }
    state[name] = value
    this.setState(state)
  }

  render() {
    return <div className="widget repeat loop">
      <span>Разослать</span>
      <input
        name="repeat"
        value={this.state.repeat}
        onChange={this.onChange}/>
      <span>раз</span>
    </div>
  }
}
