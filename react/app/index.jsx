import React, {Component} from 'react'
import {Menu, Segment} from 'semantic-ui-react'
import {hashHistory} from 'react-router'

export default class App extends Component {
  render() {
    const items = [
      {name: 'Аккаунты', url: '/accounts'},
      {name: 'Рассылка', url: '/delivery'},
      {name: 'Приглашения', url: '/invite'},
    ]
    items.map(function (item) {
      const url = item.url
      delete item.url
      item.onClick = function () {
        hashHistory.push(url)
      }
      if (location.hash.slice(1).indexOf(url) === 0) {
        item.active = true
      }
    })

    return <div className="layout app">
      <Menu attached="top" items={items}/>
      <Segment attached="bottom" className="content">{this.props.children}</Segment>
    </div>
  }
}
