module.exports = function ({app, _require}) {
  const request = _require('request-promise')

  console.log(request)

  const [a, b, c] = app.getVersion().split('.').map(a => +a)
  const version = a * 10000 + b * 100 + c

  if (version < 30001) {
    console.log(version)
  }
}
