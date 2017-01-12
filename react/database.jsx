import {debounce, each, find, keyBy, toArray, extend} from 'lodash'
import Dexie from 'dexie'
import {pick, isObject} from 'lodash'
import package_json from '../app/package.json'
import {TaskStatus} from '../app/config'

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
application.database.migrations.forEach(function ({version, schema, upgrade}) {
  let _db = db.version(version)
  if (isObject(schema)) {
    _db = _db.stores(schema)
  }
  if (upgrade instanceof Function) {
    _db.upgrade(upgrade)
  }
})

export const MessageType = Object.freeze({
  PLAIN: 0,
  INVITE: 1
})

export {TaskStatus}

window.db = db
export default db
