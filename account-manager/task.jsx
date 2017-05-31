import Account from './account.jsx'
import AccountManager from './index.jsx'
import api from '../connect/api.jsx'
import config from '../app/config'
import db from '../store/database.jsx'
import Record from '../store/record.jsx'
import {EventEmitter} from 'events'
import {extend, random, merge, pick, each, omit} from 'lodash'
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
  static properties = ['id', 'account', 'contacts', 'status', 'after',
    'wait', 'number', 'type', 'text', 'repeat', 'created', 'time']

  constructor(state) {
    merge(this, pick(state, Task.properties))
    if (!this.type) {
      this.type = this.constructor.name
    }

    const _defaults = {
      status: config.Status.SCHEDULED,
      number: 1,
      after: 0,
      wait: 0
    }

    each(_defaults, (value, key) => {
      this[key] = isFinite(this[key]) && this[key] >= value ? +this[key] : value
    })

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
      this.restart(true)
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

  waitForAccount() {
    if (this.account.max > 0 || this.account.max > this.account.min) {
      return wait(random(this.account.min, this.account.max))
    }
  }

  debounce(method, options) {
    if (!this[method].timer) {
      this[method].timer = setTimeout(() => {
        this[method].timer = 0
        this[method](options)
      }, 5000)
    }
  }

  async report() {
    const task = await db.task.get(this.id)
    if (!this.lastReport) {
      this.lastReport = 0
    }
    const last = this.lastReport
    this.lastReport = Date.now()
    task.log = await db.log.filter(l => l.task === task.id && l.created >= last).toArray()
    await api.send('skype/task', pick(task, 'account', 'created'), omit(task, 'account', 'created'))
  }

  async start() {
    const foundQuery = await db.log
      .filter(r => r.task === this.id && r.number === this.number)
      .toArray()
    const found = foundQuery.map(r => r.contact)
    const queue = await this.contacts.filter(a => !found.find(b => a === b))
    this.started = Date.now()
    for (const id of queue) {
      await this.waitForAccount()
      const _task = await db.task.get(this.id)
      merge(this, pick(_task, 'status'))
      if (config.Status.ACCEPTED === this.status) {
        this.status = config.Status.ACCEPTED
        const record = new Record()
        record.contact = id
        record.task = this.id
        try {
          const contact = await db.contact.get(id)
          await this.iterate(contact)
          record.status = config.Status.DONE
        }
        catch (ex) {
          console.error(ex)
          record.status = config.Status.ERROR
          record.message = ex.toString()
        }
        record.number = this.number
        record.created = Date.now()
        await db.log.add(record)
        Record.emit('add', record)
        this.debounce('report')
      }
      else {
        return void 0
      }
    }
    this.number--
    this.status = this.number > 0 ? config.Status.SCHEDULED : config.Status.DONE
    if (this.wait > 0 && this.number > 0) {
      this.after = Date.now() + this.wait * 1000
    }
    await this.save()
    Task.emit('update', this)
    this.debounce('report')
  }

  stop() {
    this.status = config.Status.SCHEDULED
    return this.save()
  }

  createMessage(contact) {
    if (isFinite(contact.birthday)) {
      contact.age = Math.floor((Date.now() - contact.birthday) / (1000 * 3600 * 24 * 365))
    }
    contact.time = new Date().toLocaleString('ru-RU')
    const login = 'string' === typeof contact ? contact.split('~')[1] : contact.login
    return {
      login,
      name: contact.name,
      type: /[0-9a-f]{32}/.test(login) ? config.Type.CHAT : config.Type.PERSON,
      text: substitute(this.text, contact)
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
      const now = Date.now()
      task = await db.task
        .filter(t => config.Status.SCHEDULED === t.status && now > t.after)
        .desc('id')
        .first()
      if (task) {
        task.status = config.Status.ACCEPTED
        await task.save()
        await task.initialize()
        void task.start()
        this.emit('update', task)
        console.log('ACCEPTED', task.toString())
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

  static async restart(force = false) {
    const now = Date.now()
    const accepted = await this.getAccepted()
    for (const task of accepted) {
      if (true === force || task.account.timeout > now - task.started) {
        await task.stop()
        void task.start()
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
    if (!this._short && 'string' === typeof this.text) {
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
    for (const name of names) {
      this[name] = Type.prototype[name]
    }
  }

  pick() {
    const object = pick(this, Task.properties)
    if (this.account) {
      object.account = this.account.id || this.account
    }
    return object
  }

  create() {
    this.created = this.time = Date.now()
    const object = this.pick()
    return db.task.add(object)
  }

  save() {
    const object = this.pick()
    object.time = Date.now()
    return db.task.put(object)
  }
}

extend(Task, EventEmitter.prototype)
EventEmitter.call(EventEmitter)

class Delivery extends Task {
  static icon = 'comment'
  static title = 'Рассылка'

  iterate(contact) {
    return this.account.send(this.createMessage(contact))
  }
}

class Invite extends Task {
  static icon = 'add user'
  static title = 'Приглашения'

  async iterate(contact) {
    let {status} = await this.account.invite(this.createMessage(contact))
    if (config.Status.DONE === status) {
      status = config.Status.NONE
    }
    return db.contact.update(contact.id, {status})
  }

  static query(status = config.Status.SELECTED) {
    return db.contact.where({
      authorized: 0,
      status
    })
      .filter(c => config.Type.PERSON === c.type)
  }
}

class Clear extends Task {
  static icon = 'remove user'
  static title = 'Очистка серых контактов'

  async iterate(contact) {
    const {status} = await this.account.remove(contact)
    if (config.Status.DONE === status) {
      await db.contact.delete(contact.id)
    }
    else {
      throw new Error('Контакт не найден')
    }
  }
}

Task.Delivery = Delivery
Task.Invite = Invite
Task.Clear = Clear
