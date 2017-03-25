import api from '../connect/api.jsx'
import freeze from 'deep-freeze'
import Invalid from '../ui/page/invalid.jsx'
import package_json from '../package.json'
import React from 'react'
import {start, createTokenInfo} from '../util/index.jsx'

export default async function handshake() {
  const data = {
    app: package_json.name,
    time: start.getTime(),
    v: package_json.version,
  }
  const config = await api.send('token/handshake', data, createTokenInfo())
  if (409 === config.status) {
    Invalid.render()
    return false
  }
  api.config = freeze(config)
  api.setToken(api.config.token.id)
  return true
}
