import {defaults} from 'lodash'

const Timeout = {
  setTimeout(callback) {
    clearTimeout(this.timeout)
    this.timeoutCallback = callback
    this.updateTimeout()
  },

  clearTimeout() {
    clearTimeout(this.timeout)
    this.timeoutCallback = false
    this.timeout = false
  },

  updateTimeout() {
    clearTimeout(this.timeout)
    this.timeout = setTimeout(this.timeoutCallback, this.timeoutDuration)
  }
}

export default Timeout

// window.Timeout = Timeout
