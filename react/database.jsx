import {debounce, each, find, keyBy, toArray} from 'lodash'
import Dexie from 'dexie'

const version = Math.round(new Date('2017-01-09').getTime() / (1000 * 3600))

const db = new Dexie('mlbot')
db.version(version).stores({

})

export const MessageType = Object.freeze({
  PLAIN: 0,
  INVITE: 1
})

export const TaskStatus = Object.freeze({
  CREATED: 0,
  PROCESSING: 1,
  INVITED: 2,
  SEND: 3
})
