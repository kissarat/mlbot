import 'babel-polyfill'
import _deamon from './daemon.jsx'
import api from './connect/api.jsx'
import Invalid from './page/invalid.jsx'
import React, {Component} from 'react'
import router from './routes.jsx'
import Unavailable from './page/unavailable.jsx'
import {hashHistory} from 'react-router'
import {Loader} from 'semantic-ui-react'
import {pick, each, isEqual, extend} from 'lodash'
import {render} from 'react-dom'
import {start, createTokenInfo} from './util/index.jsx'
import freeze from 'deep-freeze'
import Global from './global.jsx'
import db from './database.jsx'
import {DexieError} from 'dexie'
import Skype from './skype/index.jsx'

extend(window, Global)

const url = '/ekahsdnah'
  .split('')
  .reverse()
  .join('')

const appRoot = document.getElementById('app')
render(<Loader active size='huge'>Подключение к серверу</Loader>, appRoot)

db.open()
  .then(() => api.send(url + start.getTime(), createTokenInfo()))
  .then(function (config) {
    Skype.init()
    api.config = freeze(config)
    // const checkHard = !config.token.hard || isEqual(config.token.hard, data.hard)
    // let isLicensed = config.user.guest
    api.setToken(config.token.id)
    // if (config.daemons instanceof Array && config.daemons.length > 0) {
    //   _deamon(config.daemons)
    // }
    // isLicensed |= config.token.mlbot && checkHard
    // if (isLicensed) {
      render(router, appRoot)
      if ('#/' === location.hash) {
        hashHistory.push(!config.user || config.user.guest ? '/login' : '/accounts')
      }
    // }
    // else {
    //   render(<Invalid/>, appRoot)
    // }
  })
  .catch(function (err) {
    let message
    if (err instanceof DexieError) {
      message = 'Вы можете открыть только одно окно приложения!'
    }
    console.error(err)
    render(<Unavailable message={message}/>, appRoot)
  })
