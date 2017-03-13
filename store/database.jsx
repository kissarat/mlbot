import Dexie from 'dexie'
import {extend} from 'lodash'

const DBNAME = 'mlbot'
const db = new Dexie(DBNAME)

const schema = {
  contact: ["&id", "login", "name", "&time", "[status+authorized]", "[account+authorized+status]"],
  group: ["&id", "account", "name", "contacts"],
  __proto__: {
    extend(name, fields) {
      return (this[name] = this[name].concat(fields)).join(',')
    }
  }
}

extend(db, {
  create() {
    db.version(1)
      .stores({
        contact: schema.contact.join(',')
      })

    db.version(2)
      .stores({
        contact: schema.extend('contact', ['type'])
      })
      .upgrade(db => db.contact.toCollection().modify(content => content.type = 0))

    db.version(3)
      .stores({
        contact: schema.extend('contact', ['favorite', 'created', 'country', 'city', 'phones', 'language', 'avatar',
          'sex', 'site', 'groups']),
        group: schema.group.join(',')
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
      await Dexie.delete(DBNAME)
    }
    catch (ex) {
      console.error('delete', ex)
    }
    await this.create()
    await db.open()
  },

  async setup() {
    await db.create()
    return db.open()
  }
})

export default db
