import db from '../store/database.jsx'
import AccountManager from '../account-manager/index.jsx'
import config from '../app/config'
import {wait} from '../util/index.jsx'
import {random} from 'lodash'

/**
 * @property {number} started
 * @static {Account[]} active
 * @property {Task} task
 * @property {Account} account
 */
export default class Job {
  isActive = true
  static active = []

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
    const active = await this.task.contacts.filter(a => !found.find(b => a === b))
    this.started = Date.now()
    for (const id of active) {
      if (this.isActive) {
        const record = {
          contact: id,
          task: this.task.id
        }
        try {
          await this.wait()
          await this.iterate(id)
          record.status = config.Status.DONE
        }
        catch (ex) {
          record.status = config.Status.ERROR
          record.message = ex.toString()
        }
        db.log.add(record)
      }
      else {
        return
      }
    }
    return db.task.filter(t => this.task.id === t.id).modify({status: config.Status.DONE})
  }

  toString() {
    return this.task.toString()
  }

  createMessage(contact) {
    const login = contact.split('~')[1]
    return {
      login,
      text: this.task.text
    }
  }

  stop = () => {
    this.isActive = false
  }
}

class Delivery extends Job {
  iterate(contact) {
    return this.account.send(this.createMessage(contact))
  }
}

Job.Delivery = Delivery
