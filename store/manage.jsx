import Account from '../account-manager/account.jsx'
import Task from '../account-manager/task.jsx'
import Record from './record.jsx'
import db from './database.jsx'

db.create = function create() {
  this.version(2)
    .upgrade(db => db.contact.toCollection().modify(content => content.type = 0))

  this.version(3)
    .stores({
      contact: `&id, login, name, &time, [status+authorized], [account+authorized+status], type,
        favorite, created, country, city, phones, language, avatar, sex, site, groups`,
      group: '&id, account, name, contacts',
    })

  this.version(4)
    .stores({
      task: '++&id, contacts, after, wait, number, repeat, type, text, time',
      log: '++&id, contact, task, status, number, time',
      account: '&id, password, min, max, desktop, max_invite, web, server, headers, time',
    })

  this.account.mapToClass(Account)
  this.log.mapToClass(Record)
  this.task.mapToClass(Task)
}

db.reset = async function reset() {
  try {
    if (this.isOpen()) {
      await this.close()
    }
    await this.delete()
    await this.create()
    await this.open()
  }
  catch (ex) {
    console.error(ex)
  }
}

db.setup = async function setup() {
  await this.create()
  return this.open()
}

export default db
