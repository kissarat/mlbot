const fs = require('fs-promise')
const os = require('os')

const dataPath = process.env.HOME + '/.mlbot'

try {
  fs.accessSync(dataPath, fs.constants.W_OK | fs.constants.X_OK)
}
catch (ex) {
  fs.mkdirSync(dataPath, 0b111000000)
  const packageFile = fs.readJsonSync(__dirname + '/../package.json')
  packageFile.created = new Date()
  packageFile.os = {
    arch: os.arch(),
    platform: process.platform,
    release: os.release()
  }
  packageFile.user = os.userInfo()
  packageFile.env = process.env
  fs.writeJsonSync(dataPath + '/package.json', packageFile)
}

const filename = dataPath + '/data.sqlite'
// const filename = '/tmp/data.sqlite'

const sqlite = require('knex')({
  client: 'sqlite3',
  useNullAsDefault: true,
  connection: {
    filename
  }
})

sqlite.initDatabase = function () {
  return sqlite.table('sqlite_master')
    .where({type: 'master'})
    .count('count(*) as count')
    .first('count')
    .then(function ({count}) {
      if (count <= 0) {
        return fs
          .readFile(__dirname + '/../schema.sql')
          .then(sql => sqlite.raw(sql.toString()))
          .then(function () {
            console.log('Database schema created')
          })
      }
    })
}

module.exports = sqlite
