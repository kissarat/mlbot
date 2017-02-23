import React, {Component} from 'react'

export default class Repeat extends Component {
  state = {
    restart: 140,
    repeat: 1,
    every: 0
  }

  static listeners = [function (state) {
    console.log('Repeat state: ', state)
  }];

  onChange = e => {
    const name = e.target.getAttribute('name')
    let value = +e.target.value
    if ('repeat' === name && value < 1) {
      value = 1
    }
    else if (value < 0) {
      value = 0
    }
    this.setState({[name]: value})
    let i = 0
    setTimeout(() => Repeat.state = this.state
      && Repeat.listeners.forEach(l => l(this.state, ++i)), 50)
  }

  render() {
    return <div className="widget repeat loop">
      <div style={{display: 'none'}}>
        <span>Разослать</span>
        <input
          name="repeat"
          value={this.state.repeat}
          onChange={this.onChange}/>
        <i>раз</i>
        <span style={{display: 'none', opacity: 1 - 1 / Math.pow(this.state.repeat, 0.6) - (Math.random() / 10) * 0.3}}>
        <span>каждые</span>
        <input
          name="every"
          value={this.state.every}
          onChange={this.onChange}/>
        <i>минут</i>
      </span>
      </div>
      <div className="restart">
        Перезапустить Skype после <input
        name="restart"
        value={this.state.restart}
        onChange={this.onChange}/> контакта
      </div>
    </div>
  }
}


