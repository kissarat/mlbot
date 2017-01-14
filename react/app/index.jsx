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

import React, {Component} from 'react'
import {Menu, Segment, Checkbox} from 'semantic-ui-react'
import {hashHistory} from 'react-router'
import config from '../../app/config'
import {each} from 'lodash'

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

  render() {
    const devMode = config.dev ?
      <Menu.Item>
        <Checkbox
          label="Режим разработчика"
          value={isDevMode ? 'dev' : ''}
          onChange={(e, d) => this.developerMode(d.checked)}/>
      </Menu.Item>
    : ''
    return <div className="layout app">
      <Menu attached="top">
        <Menu.Item name="Аккаунты" {...itemUrl('/accounts')}/>
        <Menu.Item name="Рассылка" {...itemUrl('/delivery')}/>
        <Menu.Item name="Приглашения" {...itemUrl('/invite')}/>
        {devMode}
      </Menu>
      <Segment attached="bottom" className="content">{this.props.children}</Segment>
    </div>
  }
}
