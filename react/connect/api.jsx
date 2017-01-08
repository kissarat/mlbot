import {isEmpty, each} from 'lodash'
import qs from '../util/index.jsx'
import config from '../../app/config'

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
      url += '?' + qs.stringify(params)
    }
    return url
  }

  get(url, params) {
    url = this.prefix + this.buildURL(url, params)
    return fetch(url, {headers}).then(r => r.json())
  }

  send(url, params, data) {
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
    return fetch(this.prefix + url, options)
      .then(a => a.json())
  }

  get entities() {
    return this.config.entities
  }

  logout() {
    return this.send('user/logout')
  }
}

const api = new API()
export default api
window.api = api
