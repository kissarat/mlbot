import 'babel-polyfill'
import './style.scss'
import React, {Component} from 'react'
import Unavailable from './page/unavailable.jsx'
import {Loader} from 'semantic-ui-react'
import {pick, each, isEqual, extend} from 'lodash'
import {render} from 'react-dom'
import Global from './global.jsx'
import router from './routes.jsx'
import db from './database.jsx'
import {DexieError} from 'dexie'
import {hashHistory} from 'react-router'
import api from './connect/api.jsx'
import handshake from './handshake.jsx'

extend(window, Global)

const appRoot = document.getElementById('app')
render(<Loader active size='huge'>Подключение к серверу</Loader>, appRoot)

db.open()
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
        console.error(ex)
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
    console.error(err)
    render(<Unavailable message={message}/>, appRoot)
  })
