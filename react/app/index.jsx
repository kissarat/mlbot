import React, {Component} from 'react'
import Menu from '../widget/menu.jsx'

const items = Menu.normalize([
  ['Аккаунты', '/accounts'],
  ['Рассылка сообщений', '/delivery'],
])

export default class App extends Component {
  render() {
    return <div className="layout app">
        <nav>
          <Menu items={items}/>
        </nav>
        <div className="content">{this.props.children}</div>
    </div>
  }
}
