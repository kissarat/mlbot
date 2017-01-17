Object.defineProperties(window, {
  isDevMode: {
    get() {
      return !!+localStorage.getItem('dev')
    },

    set(value) {
      localStorage.setItem('dev', value ? 1 : 0)
    }
  }
})

import Footer from '../widget/footer.jsx'
import React, {Component} from 'react'
import {each} from 'lodash'
import {hashHistory} from 'react-router'
import {Menu, Segment, Image} from 'semantic-ui-react'
import api from '../connect/api.jsx'

function itemUrl(url) {
  return {
    active: location.hash.slice(1).indexOf(url) === 0,
    onClick() {
      hashHistory.push(url)
    }
  }
}

export default class App extends Component {
  developerMode(value) {
    each(document.querySelectorAll('webview'), function (webview) {
      if (value) {
        webview.openDevTools()
      }
      else {
        webview.closeDevTools()
      }
    })
    window.isDevMode = value
  }

  async logout() {
    await api.logout()
    hashHistory.push('/login')
  }

  render() {
    return <div className="layout app">
      <Menu attached="top">
        <Menu.Item>
          <Image src="images/menu-logo.png"/>
        </Menu.Item>
        <Menu.Item name="Аккаунт" {...itemUrl('/accounts')}/>
        <Menu.Item name="Рассылка" {...itemUrl('/delivery')}/>
        <Menu.Item {...itemUrl('/invite')}>
          Добавить друзей
        </Menu.Item>
        <Menu.Item name="Выход" onClick={this.logout}/>
      </Menu>
      <Segment attached="bottom" className="content">{this.props.children}</Segment>
      <Footer/>
    </div>
  }
}
