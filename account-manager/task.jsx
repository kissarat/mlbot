import Account from './account.jsx'
import AccountManager from './index.jsx'
import config from '../app/config'
import db from '../store/database.jsx'
import Record from '../store/record.jsx'
import {EventEmitter} from 'events'
import {extend, random, merge} from 'lodash'
import {substitute} from '../util/linguistics.jsx'
import {wait} from '../util/index.jsx'

/**
 * @property {number} id
 * @property {number} status
 * @property {Account|string} account
 * @property {string} type
 * @property {string} text
 * @property {Object[]} contacts
 */
export default class Task {
  constructor(state) {
    merge(this, state)
    if (!this.type && this.constructor.name !== 'Task') {
      this.type = this.constructor.name
    }
    else if ('string' === typeof this.type) {
      throw new Error('Task.type is not string', this.type)
    }

    if ('number' === typeof this.status) {
      this.status = config.Status.SCHEDULED
    }

    console.log('STATE MERGED', this.type, state)
  }

  static async isRunning() {
    const count = await db.task.filter(t => config.Status.ACCEPTED === t.status).count()
    return count > 0
  }

  static get enabled() {
    return config.task.enabled
  }

  static set enabled(v) {
    config.task.enabled = v
    if (v) {
      this.boot()
    }
    else {
      clearInterval(this._timer)
    }
  }

  static boot() {
    if (!this._timer && config.task.enabled) {
      this._timer = setInterval(this.serve, config.task.interval)
    }
  }

  static serve = async() => {
    await Task.restart()
    await Task.start()
  }

  iterate() {
    throw new Error('Job.iterate is unimplemented for ' + this.toString())
  }

  wait() {
    if (this.account.max > 0 || this.account.max > this.account.min) {
      return wait(random(this.account.min, this.account.max))
    }
  }

  async start() {
    // await db.task.update(this.id, {status: config.Status.ACCEPTED})
    const found = (await db.log.filter(r => r.task === this.id).toArray())
      .map(r => r.contact)
    const queue = await this.contacts.filter(a => !found.find(b => a === b))
    this.started = Date.now()
    for (const id of queue) {
      await this.wait()
      const _task = await db.task.get(this.id)
      if (config.Status.ACCEPTED === _task.status) {
        this.status = config.Status.ACCEPTED
        const record = new Record()
        record.contact = id
        record.task = this.id
        try {
          await this.iterate(id)
          record.status = config.Status.DONE
        }
        catch (ex) {
          console.error(ex)
          record.status = config.Status.ERROR
          record.message = ex.toString()
        }
        await db.log.add(record)
        Record.emit('add', record)
      }
      else {
        return void 0
      }
    }
    this.status = config.Status.DONE
    await db.task.update(this.id, {status: this.status})
    Task.emit('update', this)
  }

  stop = () => db.task.update(this.id, {status: config.Status.SCHEDULED})

  createMessage(contact) {
    const login = 'string' === typeof contact ? contact.split('~')[1] : contact.login
    return {
      login,
      type: /[0-9a-f]{32}/.test(login) ? config.Type.CHAT : config.Type.PERSON,
      text: substitute(this.text)
    }
  }

  static async start() {
    config.task.enabled = true
    let task = await this.getByStatus(config.Status.ACCEPTED)
    if (task) {
      // console.log('CONTINUE', task.toString())
      // await task.initialize()
      // void task.start()
    }
    else {
      task = await this.getByStatus(config.Status.SCHEDULED)
      if (task) {
        console.log('ACCEPTED', task.toString())
        task.status = config.Status.ACCEPTED
        await db.task.update(task.id, {status: task.status})
        await task.initialize()
        task.start()
        this.emit('update', task)
      }
    }
  }

  /**
   * @param {number} status
   * @returns {Promise.<Task>}
   */
  static getByStatus(status) {
    return db.task
      .filter(t => status === t.status)
      .desc('id')
      .first()
  }

  /**
   * @return {Promise.<Task[]>} 
   */
  static getAccepted() {
    return db.task.filter(t => config.Status.ACCEPTED === t.status).toArray()
  }

  static async restart() {
    const now = Date.now()
    const accepted = await this.getAccepted()
    for (const task of accepted) {
      if (task.account.timeout > now - task.started) {
        task.stop()
        task.start()
      }
    }
  }

  static async stop() {
    config.task.enabled = false
    const tasks = await this.getAccepted()
    for (const task of tasks) {
      task.stop()
    }
    await db.task
      .filter(t => config.Status.ACCEPTED === t.status)
      .modify({status: config.Status.SCHEDULED})
  }

  get short() {
    if (!this._short) {
      this._short = this.text
        .replace(/\s+/g, ' ')
        .replace(/▁▁▁▁▁▁▁▁▁▁▁▁▁.*$/m, '')
        .slice(0, 20)
    }
    return this._short
  }

  toString() {
    const contacts = typeof this.contacts instanceof Array ? this.contacts.length : this.contacts
    return `${this.account} of ${contacts.length} contacts`
  }

  async initialize() {
    const names = ['iterate']
    const Type = Task[this.type]
    if (!(this.account instanceof Account)) {
      this.account = await AccountManager.get(this.account)
    }
    for(const name of names) {
      this[name] = Type.prototype[name]
    }
  }
}

class Delivery extends Task {
  static icon = 'comment'
  static title = 'Рассылка'

  iterate(contact) {
    return this.account.send(this.createMessage(contact))
  }
}

extend(Task, EventEmitter.prototype)
EventEmitter.call(EventEmitter)

class Invite extends Task {
  static icon = 'add user'
  static title = 'Приглашения'

  iterate(contact) {
    return this.account.invite(this.createMessage(contact))
  }
}

class Clear extends Task {
  static icon = 'trash'
  static title = 'Очистка серых контактов'

  iterate(contact) {
    return this.account.remove(contact)
  }
}

Task.Delivery = Delivery
Task.Invite = Invite
Task.Clear = Clear
