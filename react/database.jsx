import {debounce, each, find, keyBy, toArray} from 'lodash'
import Dexie from 'dexie'
import {pick, isObject} from 'lodash'
import package_json from '../app/package.json'

function getVersion(time) {
  return Math.round(new Date(time).getTime() / (1000 * 3600))
}

window.application = pick(package_json,
  'name', 'version', 'author', 'description', 'repository', 'bugs', 'homepage')
application.database = {
  name: 'mlbot',
  version: getVersion('2017-01-09'),
  migrations: [
    {
      version: getVersion('2017-01-09'),
      schema: {
        contact: '&id, [account+login], name, s',
        message: '++id, type, text',
        task: '++id, [contact+message], status'
      }
    }
  ]
}

const db = new Dexie(application.database.name)
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

export const TaskStatus = Object.freeze({
  CREATED: 0,
  PROCESSING: 1,
  INVITED: 2,
  SEND: 3
})

window.db = db
export default db
