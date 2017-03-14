import Dexie from 'dexie'
import {extend} from 'lodash'

const DBNAME = 'mlbot'
const db = new Dexie(DBNAME)

extend(db, {
  create() {
    // db.version(2)
    //   .upgrade(db => db.contact.toCollection().modify(content => content.type = 0))

    db.version(3)
      .stores({
        contact: `&id, login, name, &time, [status+authorized], [account+authorized+status], type,
        favorite, created, country, city, phones, language, avatar, sex, site, groups`,
        group: '&id, account, name, contacts'
      })
  },

  async reset() {
    try {
      if (db.isOpen()) {
        await db.close()
      }
      await db.delete()
      await db.create()
      await db.open()
    }
    catch (ex) {
      console.error(ex)
    }
  },

  async setup() {
    await db.create()
    return db.open()
  }
})

export default db
