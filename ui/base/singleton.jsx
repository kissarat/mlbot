import {pick, merge} from 'lodash'

const Singleton = {
  one() {
    if (!this.instance) {
      this.instance = new this()
    }
    return this.instance
  },

  get(propNames) {
    return pick(this.one(), propNames)
  },

  set(state) {
    return merge(this.one(), state)
  }
}

export default Singleton
