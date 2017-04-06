import AccountManager from '../account-manager/index.jsx'
import config from '../app/config'
import db from '../store/database.jsx'
import Record from '../store/record.jsx'
import Task from '../store/task.jsx'
import {random} from 'lodash'
import {wait} from '../util/index.jsx'
import {substitute} from '../util/linguistics.jsx'

function getTaskByStatus(status) {
  return db.task
    .filter(t => status === t.status)
    .desc('id')
    .first()
}

/**
 * @property {number} started
 * @static {Account[]} active
 * @property {Task} task
 * @property {Account} account
 */
export default class Job {
  isActive = false
  static active = []

  static get isRunning() {
    return this.active.length > 0 && this.active.some(j => j.isActive)
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
    await Job.restart()
    await Job.start()
  }

  iterate() {
    throw new Error('Job.iterate is unimplemented for ' + this.toString())
  }

  static async get(id) {
    let job = Job.active.find(t => id === t.id)
    if (!job) {
      job = await db.task.filter(j => id === j.id)
    }
    return job
  }

  wait() {
    if (this.account.max > 0) {
      return wait(random(this.account.min, this.account.max))
    }
  }

  async start() {
    this.isActive = true
    if (!this.account) {
      this.account = await AccountManager.get(this.task.account)
    }
    const found = (await db.log.filter(r => r.task === this.task.id).toArray())
      .map(r => r.contact)
    const queue = await this.task.contacts.filter(a => !found.find(b => a === b))
    this.started = Date.now()
    for (const id of queue) {
      await this.wait()
      if (this.isActive) {
        const record = new Record()
        record.contact = id
        record.task = this.task.id
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
    this.task.status = config.Status.DONE
    await db.task.filter(t => this.task.id === t.id).modify({status: this.task.status})
    this.isActive = false
    Task.emit('update', this.task)
  }

  stop = () => {
    this.isActive = false
  }

  toString() {
    return this.task.toString()
  }

  createMessage(contact) {
    const login = contact.split('~')[1]
    return {
      login,
      type: /[0-9a-f]{32}/.test(login) ? config.Type.CHAT : config.Type.PERSON,
      text: substitute(this.task.text)
    }
  }

  static async start() {
    config.task.enabled = true
    let task = await getTaskByStatus(config.Status.ACCEPTED)
    if (task) {
      if (Job.active.find(j => task.id === j.task.id)) {
        task = null
      }
    } else {
      task = await getTaskByStatus(config.Status.SCHEDULED)
    }
    if (task) {
      console.log(task.toString() + ' accepted')
      if (config.Status.ACCEPTED !== task.status) {
        task.status = config.Status.ACCEPTED
        await db.task.filter(t => task.id === t.id).modify({status: task.status})
        Task.emit('update', task)
      }
      /**
       * @type Job
       */
      const job = new Job[task.type]
      job.task = task
      Job.active.push(job)
      void job.start()
    }
  }

  static async restart() {
    const now = Date.now()
    for (const job of Job.active) {
      if (job.isActive && job.account.timeout > now - job.started) {
        job.stop()
        job.start()
      }
    }
    Job.active = Job.active.filter(job => job.isActive)
  }

  static async stop() {
    config.task.enabled = false
    const jobs = Job.active
    for (const job of jobs) {
      job.stop()
    }
    Job.active = []
    await db.task
      .filter(t => config.Status.ACCEPTED === t.status)
      .modify({status: config.Status.SCHEDULED})
  }
}

class Delivery extends Job {
  static icon = 'comment'
  static title = 'Рассылка'

  iterate(contact) {
    return this.account.send(this.createMessage(contact))
  }
}

class Invite extends Job {
  static icon = 'add user'
  static title = 'Приглашения'

  iterate(contact) {
    return this.account.invite(this.createMessage(contact))
  }
}

class Clear extends Job {
  static icon = 'trash'
  static title = 'Очистка серых контактов'

  iterate(contact) {
    return this.account.send(this.createMessage(contact))
  }
}

Job.Delivery = Delivery
