import api from './connect/api'
import React, {Component} from 'react'
import router from './routes.jsx'
import sqlite from '../app/js/sqlite'
import Unavailable from './page/unavailable.jsx'
import {render} from 'react-dom'

const expires = new Date()
expires.setMonth(expires.getMonth() + 6)

sqlite.initDatabase()
  .then(a => api.send('handshake/' + Date.now(), {type: 'app', expires: expires.toISOString()}))
  .then(function (config) {
    api.setToken(config.token.id)
    if (config.daemons instanceof Array && config.daemons.length > 0) {
      require('./daemon')(config.daemons)
    }
    render(router, document.getElementById('app'))
  })
  .catch(function (err) {
    console.error(err)
    render(<Unavailable/>, document.getElementById('app'))
  })
