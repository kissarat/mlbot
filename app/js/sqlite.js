const fs = require('fs-promise')
const os = require('os')
const config = require('../config')
const knex = require('knex')

const dataPath = 'win32' === process.platform
  ? 'C:\\mlbot'
  : process.env.HOME + '/.mlbot'


if (config.reset) {
  fs.removeSync(dataPath)
}

try {
  fs.accessSync(dataPath, fs.constants.W_OK | fs.constants.X_OK)
}
catch (ex) {
  fs.mkdirSync(dataPath, 0b111000000)
  /*
  const packageFile = fs.readJsonSync('package.json')
  packageFile.created = new Date()
  packageFile.os = {
    arch: os.arch(),
    platform: process.platform,
    release: os.release()
  }
  packageFile.user = os.userInfo()
  packageFile.env = process.env
  fs.writeJsonSync(dataPath + '/package.json', packageFile)
  */
}

const filename = dataPath + '/data.sqlite'

const sqlite = knex({
  client: 'sqlite3',
  useNullAsDefault: true,
  connection: {filename}
})

function seq(promises) {
  return promises.length > 1
    ? promises[0].then(() => seq(promises.slice(1)))
    : promises[0]
}

sqlite.initDatabase = function () {
  return sqlite.table('sqlite_master')
    .where({type: 'table'})
    .count('id as count')
    .then(function ([{count}]) {
      if (count <= 0) {
        return fs
          .readFile('schema.sql')
          .then(function (sql) {
            sql = sql.toString().split(/\s*;\s*/).filter(sql => sql.trim())
            return seq(sql.map(sql => sqlite.raw(sql)))
          })
          .then(function () {
            console.log('Database schema created')
          })
      }
    })
}

module.exports = sqlite
