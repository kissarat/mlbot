import {merge, defaults, isObject, extend} from 'lodash'
import Dexie from 'dexie'
import {Status} from '../../app/config'

export default function Query(driver, state) {
  this.state = state
  this.driver = driver
}

Query.prototype = {
  request(params) {
    if (!this.listener) {
      return false
    }
    const start = Date.now()
    const newState = params || {}
    defaults(newState, this.state)
    return this.driver.request(newState)
      .then(response => {
        console.log(`Query time ${Date.now() - start}`, response)
        this.state = newState
        defaults(response, this.state)
        const next = this.next
        if (next) {
          this.next = false
          if (next instanceof Function) {
            next()
          }
        }
        if (this.listener) {
          console.log(response)
          this.listener(response)
        }
        else {
          this.next = false
        }
      })
      .catch(err => {
        if (err instanceof Dexie.AbortError) {
          console.error('Abort')
        }
        else {
          console.error(err)
        }
      })
  },

  query(params) {
    return this.driver.query(params
      ? defaults(params, this.state)
      : this.state)
  },

  async delete(params) {
    await this.query(params).delete()
    await this.request()
  },

  async update(params, changes) {
    await this.query(params).update(changes)
    await this.request()
  },

  listen(listener) {
    this.listener = listener
    return this
  },

  opposite() {
    return Status.CREATED === this.state.status ? this.queries.selectedPage : this.queries.otherPage
  },

  extend(proto) {
    return extend(this, proto)
  }
}
