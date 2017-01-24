import {merge, defaults, isObject} from 'lodash'

export default function Query(state, work) {
  this.state = state
  this.work = work
  this.busy = false
}

Query.prototype = {
  request(params) {
    if (this.busy) {
      this.next = params
    } else {
      this.busy = true
      if (params) {
        merge(this.state, params)
      }
      return this.work(this.state)
        .then(r => this.debounce(r))
        .catch(function (err) {
          console.error(err)
        })
    }
  },

  debounce(response) {
    defaults(response, this.state)
    if (this.listener) {
      this.listener(response)
      if (this.busy) {
        this.busy = false
        this.request(this.next)
      }
    }
    this.busy = false
  },

  listen(listener) {
    this.listener = listener
    return this
  }
}
