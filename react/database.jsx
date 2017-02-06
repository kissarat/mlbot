import Dexie from 'dexie'
import {extend} from 'lodash'

const db = new Dexie('mlbot')

const Database = {
  create() {
    db.version(2)
      .stores({
        contact: `&id, login, name, &time, online,
        [status+authorized], [account+authorized+status], [account+authorized+status+online]`
      })
  },

  async reset() {
    await db.delete()
    await this.create()
    await db.open()
  }
}

extend(db, Database)
db.create()

export default db
