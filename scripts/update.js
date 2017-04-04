const request = require('request-promise')

module.exports = async function ({app}) {
  const [a, b, c] = app.getVersion().split('.').map(a => +a)
  const version = a * 10000 + b * 100 + c

  if (version < 30001) {
    
  }
}
