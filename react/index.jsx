import {render} from 'react-dom'
import router from './routes.jsx'
import React, {Component} from 'react'
import api from './connect/api'
import sqlite from '../app/js/sqlite'
import Unavailable from './page/unavailable.jsx'

const expires = new Date()
expires.setMonth(expires.getMonth() + 6)

sqlite.initDatabase()
  .then(a => api.send('handshake/' + Date.now(), {type: 'app', expires: expires.toISOString()}))
  .then(function (config) {
    api.setToken(config.token.id)
    render(router, document.getElementById('app'))
  })
  .catch(function (err) {
    console.error(err)
    render(<Unavailable/>, document.getElementById('app'))
  })
