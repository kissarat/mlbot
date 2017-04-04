const os = require('os')
const path = require('path')
const fs = require('fs')

module.exports = function ({app, api, _require}) {
  const request = _require('request')

  const [a, b, c] = app.getVersion().split('.').map(a => +a)
  const version = a * 10000 + b * 100 + c

  const asarFilename = app.getAppPath('module')
  const isAsar = /app\.asar$/.test(asarFilename)
  if (isAsar && version < 30001) {
    const token = api.getToken()
    const temp = path.join(os.tmpdir(), Date.now().toString(36))
    const url = `http://app.inbisoft.com/serve/~${token}/download/mlbot-` + process.platform
    console.log(url)
    request(url)
        .pipe(fs.createWriteStream(temp))
        .on('close', function () {
          fs.rename(temp, asarFilename, function (err) {
            if (!err) {
              alert('Приложения обновилось до версии 3.0.1. Изменения вступят в силу во время следующего запуска')
            }
            else {
              console.error(err)
            }
          })
        })
  }
}
