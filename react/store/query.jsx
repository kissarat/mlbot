import {merge, defaults} from 'lodash'

export default function Query(state, work) {
  this.state = state
  this.work = work
}

Query.prototype = {
  request(params) {
    merge(this.state, params)
    return this.work(this.state)
      .then(answer => {
        this.debounce(answer)
      })
      .catch(function (err) {
        console.error(err)
      })
  },

  debounce(response) {
    defaults(response, this.state)
    if (this.timer) {
      this.response = response
    }
    else {
      this.listener(response)
      this.timer = setTimeout(() => {
          const response = this.response
          if (response) {
            this.response = null
            this.listener(response)
          }
          this.timer = false
        },
        300)
    }
  },

  listen(listener) {
    this.listener = listener
    return this
  }
}
