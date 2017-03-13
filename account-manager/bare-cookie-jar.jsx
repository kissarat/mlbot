const qs = require('querystring')

export default class BarCookieJar {
  constructor(string) {
    this.string = string
    this.jar = qs.parse(string, '; ')
  }

  setCookie(cookieOrString, uri, options) {
    console.log('setCookie is not implemented', cookieOrString, uri, options)
  }

  getCookieString() {
    return this.string
    // return qs.stringify(this.jar, '; ')
  }

  getCookie(uri) {
    console.log('getCookie is not implemented', uri)
  }
}
