import {merge, defaults} from 'lodash'

export default function Query(state, work) {
  this.state = state
  this.work = work
}

Query.prototype = {
  request(params) {
    console.log(params)
    if (!this.next) {
      this.next = params
      merge(this.state, params)
      return this.work(this.state)
        .then(r => this.debounce(r))
        .catch(function (err) {
          console.error(err)
        })
    }
  },

  debounce(response) {
    const next = this.next
    defaults(response, this.state)
    console.log(response)
    if (this.listener) {
      this.listener(response)
      if (next) {
        this.request(next)
      }
    }
    this.next = false
  },

  listen(listener) {
    this.listener = listener
    return this
  }
}
