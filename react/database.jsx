import Dexie from 'dexie'
import package_json from '../app/package.json'
import {debounce, each, find, keyBy, toArray, extend} from 'lodash'
import {pick, isObject, merge} from 'lodash'

function getVersion(time) {
  return Math.round(new Date(time).getTime() / (1000 * 3600))
}

window.application = pick(package_json,
  'name', 'version', 'author', 'description', 'repository', 'bugs', 'homepage')
application.database = {
  name: 'mlbot',
  version: getVersion('2017-01-12'),
  migrations: [
    {
      version: getVersion('2017-01-12'),
      schema: {
        contact: '&id, account, login, name, status, authorized',
        // message: '++id, type, text',
        // task: '++id, [contact+message], status'
      }
    }
  ]
}

let db = new Dexie(application.database.name)

merge(db, {
  migrate() {
    application.database.migrations.forEach(function ({version, schema, upgrade}) {
      let _db = db.version(version)
      if (isObject(schema)) {
        _db = _db.stores(schema)
      }
      if (upgrade instanceof Function) {
        _db.upgrade(upgrade)
      }
    })
  },

  async reset() {
    await db.delete()
    this.migrate()
  }
})

db.migrate()

window.db = db
export default db
