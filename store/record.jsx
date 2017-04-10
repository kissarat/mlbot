import {isObject} from 'lodash'
import {EventEmitter} from 'events'
import {extend} from 'lodash'

const n = Symbol.for('name')

export default class Record {
  static joins = ['task', 'contact']

  get name() {
    if (!this[n]) {
      let name
      if (isObject(this.contact)) {
        name = this.contact.login
        if (this.contact.name) {
          name += ` (${this.contact.name})`
        }
      }
      else {
        name = 'string' === typeof this.contact ? this.contact.split('~')[1] : ''
      }
      this[n] = name
    }
    return this[n]
  }
}

extend(Record, EventEmitter.prototype)
EventEmitter.call(Record)
