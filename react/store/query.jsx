import {merge, defaults, isObject} from 'lodash'
import Dexie from 'dexie'

export default function Query(state, work) {
  this.state = state
  this.work = work
}

Query.prototype = {
  request(params) {
    if (this.next) {
      return this.next = () => this.request(params)
    }
    else {
      this.next = true
    }
    const start = Date.now()
    const newState = params || {}
    defaults(newState, this.state)
    return this.work(newState)
      .then(response => {
        console.log(`Query time ${Date.now() - start}`)
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
          this.listener(response)
        }
        else {
          this.next = false
        }
      })
      .catch(err => {
        if (err instanceof AbortError) {
          console.error('Abort')
        }
        else {
          console.error(err)
        }
      })
  },

  requestNext() {

  },

  listen(listener) {
    this.listener = listener
    return this
  }
}
