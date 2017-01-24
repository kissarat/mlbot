import {merge, defaults, isObject} from 'lodash'

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
    const newState = params || {}
    defaults(newState, this.state)
    return this.work(newState)
      .then(response => {
        this.state = newState
        defaults(response, this.state)
        const next = this.next
        if (next) {
          this.next = false
          if (next instanceof Function) {
            return next()
          }
        }
        if (this.listener) {
          this.listener(response)
        }
        else {
          this.next = false
        }
      })
      .catch(function (err) {
        console.error(err)
      })
  },

  listen(listener) {
    this.listener = listener
    return this
  }
}
