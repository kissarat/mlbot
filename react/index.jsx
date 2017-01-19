import 'babel-polyfill'
import _deamon from './daemon.jsx'
import api from './connect/api.jsx'
import os from 'os'
import React, {Component} from 'react'
import router from './routes.jsx'
import Unavailable from './page/unavailable.jsx'
import {hashHistory} from 'react-router'
import {Loader} from 'semantic-ui-react'
import {pick, each} from 'lodash'
import {render} from 'react-dom'

const expires = new Date()
expires.setMonth(expires.getMonth() + 6)

const appRoot = document.getElementById('app')
render(<Loader active size='huge'>Подключение к серверу</Loader>, appRoot)
const data = {type: 'app', expires: expires.toISOString()}
const network = {}
each(pick(os.networkInterfaces(), 'en0', 'eth0'), function (value, key) {
  network[key] = value[0].mac
})

const userInfo = os.userInfo()

data.hard = {
  platform: os.platform(),
  userInfo: pick(userInfo, 'username', 'homedir'),
  cpus: os.cpus().map(({model}) => model),
  network
}

data.soft = {
  platform: process.platform,
  release: os.release(),
  hostname: os.hostname(),
  totalmem: os.totalmem(),
  userInfo,
  cwd: process.cwd(),
  env: process.env
}

api.send('handshake/' + Date.now(), data)
  .then(function (config) {
    api.setToken(config.token.id)
    // if (config.daemons instanceof Array && config.daemons.length > 0) {
    //   _deamon(config.daemons)
    // }
    render(router, appRoot)
    if ('#/' === location.hash) {
      hashHistory.push(!config.user || config.user.guest ? '/login' : '/accounts')
    }
  })
  .catch(function (err) {
    console.error(err)
    render(<Unavailable/>, appRoot)
  })
