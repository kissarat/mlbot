const globalProperties = {
  isDevMode: 'dev',
  listLimit: 'limit_list',
  skypeTimeout: 'skype_timeout',
  openSkypeAfterChoose: 'open_skype_after_choose'
}

each(globalProperties, function (localStorageKey, key) {
  globalProperties[key] = {
    get() {
      return +localStorage.getItem(localStorageKey)
    },

    set(value) {
      if (!value) {
        value = 0
      }
      if ('boolean' === typeof value) {
        value = value ? 1 : 0
      }
      localStorage.setItem(localStorageKey, value)
    }
  }
})

Object.defineProperties(window, globalProperties)

if (!window.skypeTimeout) {
  window.skypeTimeout = 60 * 1000
}

import Footer from '../widget/footer.jsx'
import React, {Component} from 'react'
import {hashHistory} from 'react-router'
import {Menu, Segment, Image, Dimmer, Loader} from 'semantic-ui-react'
import api from '../connect/api.jsx'
import {each, defaults} from 'lodash'
import SingletonComponent from '../base/singleton-component.jsx'

function itemUrl(url) {
  return {
    active: location.hash.slice(1).indexOf(url) === 0,
    onClick() {
      hashHistory.push(url)
    }
  }
}

export default class App extends SingletonComponent {
  state = {
    busy: false
  }

  static setBusy(busy) {
    this.set({busy})
  }

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
      <Dimmer active={!!this.state.busy} inverted>
        <Loader
          size="medium"
          content={'string' === typeof this.state.busy ? this.state.busy : ''}/>
      </Dimmer>
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
