import {EventEmitter} from 'events'
import {extend} from 'lodash'

export default class Task {
  get short() {
    if (!this[Symbol.for('short')]) {
      this[Symbol.for('short')] = this.text
        .replace(/\s+/g, ' ')
        .replace(/▁▁▁▁▁▁▁▁▁▁▁▁▁.*$/m, '')
        .slice(0, 30)
    }
    return this[Symbol.for('short')]
  }
}

extend(Task, EventEmitter.prototype)
EventEmitter.call(Task)
