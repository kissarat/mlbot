import {isObject} from 'lodash'

export default class Record {
  get name() {
    if (!this[Symbol.for('name')]) {
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
      this[Symbol.for('name')] = name
    }
    return this[Symbol.for('name')]
  }
}

// Log.Collection
