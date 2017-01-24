import Dexie from 'dexie'
import {extend} from 'lodash'

const db = new Dexie('mlbot')

const Database = {
  create() {
    db.version(1)
      .stores({
        contact: '&id, [status+authorized], [account+status+authorized], login, name, &time'
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
