export default class Timeout {
  constructor(time, callback) {
    this.time = time
    if (callback) {
      this.setCallback(callback)
    }
  }

  setCallback(callback) {
    clearTimeout(this.timer)
    this.callback = callback
    this.update()
  }

  clearCallback() {
    clearTimeout(this.timer)
    this.callback = null
  }

  update() {
    clearTimeout(this.timer)
    this.timer = setTimeout(this.callback, this.time)
  }
}

// window.Timeout = Timeout
