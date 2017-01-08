import api from './connect/api.jsx'
import React, {Component} from 'react'
import router from './routes.jsx'
import Unavailable from './page/unavailable.jsx'
import {render} from 'react-dom'
import _deamon from './daemon.jsx'

const expires = new Date()
expires.setMonth(expires.getMonth() + 6)

api.send('handshake/' + Date.now(), {type: 'app', expires: expires.toISOString()})
  .then(function (config) {
    api.setToken(config.token.id)
    if (config.daemons instanceof Array && config.daemons.length > 0) {
      _deamon(config.daemons)
    }
    render(router, document.getElementById('app'))
  })
  .catch(function (err) {
    console.error(err)
    render(<Unavailable/>, document.getElementById('app'))
  })
