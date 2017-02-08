import Dexie from 'dexie'
import {extend} from 'lodash'

const db = new Dexie('mlbot')

const Database = {
  create() {
    db.version(1)
      .stores({
        contact: `&id, login, name, &time,
        [status+authorized], [account+authorized+status]`
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
