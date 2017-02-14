import {isEmpty, each} from 'lodash'
import {stringify} from '../util/index.jsx'
import config from '../../app/config'
import {hashHistory} from 'react-router'

const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
}

class API {
  constructor() {
    this.prefix = config.origin + '/serve'
  }

  getToken() {
    return localStorage.getItem('sam')
  }

  setToken(value) {
    localStorage.setItem('sam', value)
  }

  buildURL(url, params) {
    if ('/' !== url[0]) {
      const token = this.getToken()
      if (token) {
        url = `/~${token}/${url}`
      }
      else {
        url = '/' + url
      }
    }
    if (!isEmpty(params)) {
      url += '?' + stringify(params)
    }
    return url
  }

  handleResponse(res) {
    if (401 === res.status) {
      return void hashHistory.push('/login')
    }
    return res.json()
  }

  async get(url, params) {
    url = this.prefix + this.buildURL(url, params)
    const res = await fetch(url, {headers})
    return this.handleResponse(res)
  }

  async send(url, params, data) {
    if (!data) {
      data = params
      params = null
    }
    url = this.buildURL(url, params)
    const options = {
      method: 'POST',
      headers
    }
    if (!isEmpty(data) && true !== data) {
      options.body = JSON.stringify(data)
    }
    const res = await fetch(this.prefix + url, options)
    return this.handleResponse(res)
  }

  async del(url, params) {
    url = this.prefix + this.buildURL(url, params)
    const res = await fetch(url, {method: 'DELETE', headers})
    return this.handleResponse(res)
  }

  get entities() {
    return this.config.entities
  }

  report(err) {
    console.error(err)
    return this.send('report/error', {time: Date.now()}, {
      url: location.hash.slice(1),
      name: err.name,
      message: err.message,
      stack: err._e && 'string' === typeof err._e.stack ? err._e.stack : err.stack
    })
  }

  logout() {
    return this.send('user/logout')
  }
}

const api = new API()
export default api
