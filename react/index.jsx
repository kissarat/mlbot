import api from './connect/api.jsx'
import React, {Component} from 'react'
import router from './routes.jsx'
import Unavailable from './page/unavailable.jsx'
import {render} from 'react-dom'
import {Loader} from 'semantic-ui-react'
import {hashHistory} from 'react-router'
import _deamon from './daemon.jsx'

const expires = new Date()
expires.setMonth(expires.getMonth() + 6)

const appRoot = document.getElementById('app')
render(<Loader active size='huge'>Подключение к серверу</Loader>, appRoot)

api.send('handshake/' + Date.now(), {type: 'app', expires: expires.toISOString()})
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
