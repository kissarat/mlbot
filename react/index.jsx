import 'babel-polyfill'
import _deamon from './daemon.jsx'
import api from './connect/api.jsx'
import Invalid from './page/invalid.jsx'
import React, {Component} from 'react'
import router from './routes.jsx'
import Unavailable from './page/unavailable.jsx'
import {hashHistory} from 'react-router'
import {Loader} from 'semantic-ui-react'
import {pick, each, isEqual} from 'lodash'
import {render} from 'react-dom'
import {start, createTokenInfo} from './util/index.jsx'
import freeze from 'deep-freeze'

const url = '/ekahsdnah'
  .split('')
  .reverse()
  .join('')

const appRoot = document.getElementById('app')
render(<Loader active size='huge'>Подключение к серверу</Loader>, appRoot)

api.send(url + start.getTime(), createTokenInfo())
  .then(function (config) {
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
    console.error(err)
    render(<Unavailable/>, appRoot)
  })
