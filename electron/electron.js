const sky = require('./sky')

module.exports = function (webview) {
  webview.openDevTools()
  webview.setAudioMuted(true)
  webview.addEventListener('console-message', function (e) {
    try {
      const data = JSON.parse(e.message)
      if ('string' === typeof data.type && data.mid > sky.mid) {
        sky.mid = data.mid
        if ('number' === typeof data.rid) {
          sky.reply(data)
        }
        else {
          sky.emit(data.type, data)
        }
      }
    }
    catch (ex) {

    }
  })

  sky.send = function (data) {
    data.mid = ++sky.mid
    const string = JSON.stringify(data)
    webview.executeJavaScript(`sky.receive(${string})`)
  }
}
