// import {extend} from 'lodash'

export function Emitter() {
  this._events = {}
}

Emitter.prototype = {
  on(eventName, listener) {
    let listeners = this._events[eventName]
    if (!listeners) {
      listeners = this._events[eventName] = []
    }
    listeners.push(listener)
    return this
  },

  emit(eventName) {
    const listeners = this._events[eventName]
    if (listeners) {
      const args = [].slice.call(arguments, 1)
      listeners.forEach(listener => listener.apply(this, args))
      return true
    }
    return false
  }
}

export class Sky extends Emitter {
  receive(data) {
    if ('string' === typeof data.type) {
      this.emit(data.type, data)
    }
    else {
      console.error('Data has no type', data)
    }
  }

  invoke(options) {
    this[options.action](options)
  }

  send(data) {
    data.time = Date.now()
    console.log(JSON.stringify(data))
  }
}

export const sky = new Sky();

window.sky = sky

// extend(window, {Emitter, Sky, sky})
