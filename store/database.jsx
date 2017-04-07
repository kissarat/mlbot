import Dexie from 'dexie'
import {extend} from 'lodash'

/**
 * @property {Table} account
 * @property {Table} log
 * @property {Table} task
 */
const db = new Dexie('mlbot')

export default db
