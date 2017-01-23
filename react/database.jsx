import Dexie from 'dexie'
import {debounce, each, find, keyBy, toArray, extend} from 'lodash'
import {pick, isObject, merge} from 'lodash'

const db = new Dexie('mlbot')

merge(db, {
  create() {
    return db.version(1)
      .stores({
        contact: '&id, [authorized+status], [account+status+authorized], login, name, &time'
      })
  },

  async reset() {
    await db.delete()
    await this.create()
    await db.open()
  }
})

db.create()

window.db = db
export default db
