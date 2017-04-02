import {EventEmitter} from 'events'
import {extend} from 'lodash'

const s = Symbol.for('short')

export default class Task {
  get short() {
    if (!this[s]) {
      this[s] = this.text
        .replace(/\s+/g, ' ')
        .replace(/▁▁▁▁▁▁▁▁▁▁▁▁▁.*$/m, '')
        .slice(0, 30)
    }
    return this[s]
  }

  toString() {
    const contacts = typeof this.contacts instanceof Array ? this.contacts.length : this.contacts
    return `${this.account} of ${contacts} contacts`
  }
}

extend(Task, EventEmitter.prototype)
EventEmitter.call(Task)
