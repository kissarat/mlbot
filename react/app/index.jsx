import React, {Component} from 'react'

export default class App extends Component {
  state = {}

  componentWillMount() {
    api.get('skype/accounts').then(accounts => this.setState({accounts}))
  }

  render() {
    const accounts = this.state.accounts.map(a =>
      <li key={a.username}>{a.username}</li>
    )
    return <div className="layout app">
      <div>
        <ul>{accounts}</ul>
      </div>
      {this.props.children}
    </div>
  }
}
