import {EventEmitter} from 'events'
import {extend} from 'lodash'

export default function Task() {
}

extend(Task, EventEmitter.prototype)
EventEmitter.call(Task)
