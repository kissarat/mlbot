import 'babel-polyfill'
import api from '../connect/api.jsx'
import config from '../app/config'
import db from '../store/database.jsx'
import Global from './global.jsx'
import handshake from './handshake.jsx'
import React, {Component} from 'react'
import router from '../ui/routes.jsx'
import Unavailable from '../ui/page/unavailable.jsx'
import {DexieError} from 'dexie'
import {hashHistory} from 'react-router'
import {Loader} from 'semantic-ui-react'
import {pick, each, isEqual, extend} from 'lodash'
import {render} from 'react-dom'

if (config.dev) {
  extend(window, Global)
}

const appRoot = document.getElementById('app')
render(<Loader active size='huge'>Подключение к серверу</Loader>, appRoot)

db.setup()
  .then(handshake)
  .then(function (allow) {
    if (allow) {
      try {
        render(router, appRoot)
        if ('#/' === location.hash) {
          const isGuest = !api.config.user || api.config.user.guest
          hashHistory.push(isGuest ? '/login' : '/accounts')
        }
      }
      catch (ex) {
        api.report(ex)
      }
    }
    else {
      console.error('Application not started')
    }
  })
  .catch(function (err) {
    let message
    if (err instanceof DexieError) {
      if ('VersionError' === err.name || 'UpgradeError' === err.name) {
        db.delete()
        setTimeout(() => location.reload(), 1000)
      }
      else {
        message = 'Вы можете открыть только одно окно приложения!'
      }
    }
    else {
      message = ''
    }
    if ('string' === typeof message) {
      const stack = err._e && 'string' === typeof err._e.stack ? err._e.stack : err.stack
      message += `\n______________________\n${err.name} ${err.message}\n${stack}`
    }
    api.report(err)
    render(<Unavailable message={message}/>, appRoot)
  })
