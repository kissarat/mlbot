import db from './database.jsx'
import {uniq, keyBy} from 'lodash'

export async function load(array, attrs) {
  const o = {}
  const entities = {}
  for (const name of attrs) {
    o[name] = []

  }
  for (const item of array) {
    for (const name of attrs) {
      const id = item[name]
      if (id) {
        o[name].push(id)
      }
    }
  }
  for(const name in o) {
    const ids = uniq(o[name]).sort()
    entities[name] = ids.length > 0
    ? keyBy(await db[name].filter(a => ids.indexOf(a.id) >= 0).toArray(), 'id')
    : {}
  }
  for(const item of array) {
    for(const name of attrs) {
      const id = item[name]
      item[name] = entities[name][id]
    }
  }
  return array
}

export async function joinLog(array) {
  return load(array, ['contact', 'task'])
}
