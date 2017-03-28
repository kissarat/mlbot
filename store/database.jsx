import Dexie from 'dexie'
// import Record from './record.jsx'
import {extend} from 'lodash'
import AccountSettings from './account-settings.jsx'

const DBNAME = 'mlbot'
const db = new Dexie(DBNAME)

extend(db, {
  create() {
    db.version(2)
      .upgrade(db => db.contact.toCollection().modify(content => content.type = 0))

    db.version(3)
      .stores({
        contact: `&id, login, name, &time, [status+authorized], [account+authorized+status], type,
        favorite, created, country, city, phones, language, avatar, sex, site, groups`,
        group: '&id, account, name, contacts',
      })

    db.version(4)
      .stores({
        task: '++&id, after, wait, number, text',
        log: '++&id, contact, task',
        account: '++&id, login, password, min, max, desktop',
      })

    // db.log.mapToClass(Record)
    db.account.mapToClass(AccountSettings)
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
