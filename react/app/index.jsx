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
import {Menu, Segment, Image, Dimmer, Loader, Icon} from 'semantic-ui-react'
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

  componentDidMount() {
    setTimeout(function () {
      if (!(isObject(api.config.user) && 'string' === typeof api.config.user.nick)) {
        location.reload()
      }
    }
    , 500)
  }

  render() {
    return <div className="layout app">
      <Dimmer active={!!this.state.busy} inverted>
        <Loader
          size="medium"
          content={'string' === typeof this.state.busy ? this.state.busy : ''}/>
      </Dimmer>
      <Menu icon="labeled"  compact borderless>
        <Menu.Item>
          <Image src="images/menu-logo.png"/>
        </Menu.Item>
        <Menu.Menu position="right">
          <Menu.Item name="Аккаунт" icon="skype" {...itemUrl('/accounts')}/>
          <Menu.Item name="Рассылка" icon="mail" {...itemUrl('/delivery')}/>
          <Menu.Item name="Добавить друзей" icon="group" {...itemUrl('/invite')}/>
          <Menu.Item name="Настройки" icon="setting" {...itemUrl('/settings')}/>
          <Menu.Item name="Выход" icon="sign out" onClick={this.logout}/>
          <Menu.Item name="Перезапуск" icon="refresh" onClick={() => location.reload()}/>
        </Menu.Menu>
      </Menu>
      <Segment className="content">{this.props.children}</Segment>
      <Footer/>
    </div>
  }
}
