import Dexie from 'dexie'
import {extend} from 'lodash'
import package_json from '../app/package.json'

const DBNAME = 'mlbot'
const VERSION = 'version'
const db = new Dexie(DBNAME)

const Database = {
  create() {
    db.version(1)
      .stores({
        contact: `&id, login, name, &time,
        [status+authorized], [account+authorized+status]`
      })
  },

  async reset() {
    try {
      await db.close()
    }
    catch (ex) {
      console.error('close', ex)
    }
    try {
      await db.delete()
    }
    catch (ex) {
      console.error('delete', ex)
    }
    await this.create()
    await db.open()
  },

  async setup() {
    const appVersion = localStorage.getItem(VERSION)
    // localStorage.setItem(VERSION, package_json.version)
    if (!appVersion || appVersion === package_json.version) {
      await db.create()
      return db.open()
    }
    else {
      await db.reset()
    }
  }
}

extend(db, Database)

export default db
