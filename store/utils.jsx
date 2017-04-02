import db from './database.jsx'
import {uniq, keyBy} from 'lodash'

const entities = {
  contact: {},
  task: {}
}

export async function load(array, attrs) {
  const o = {}
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
  for (const name in o) {
    const ids = uniq(o[name]).sort()
    const objects = await db[name].filter(r => ids.indexOf(r.id) >= 0).toArray()
    const collection = entities[name]
    for (const entity of objects) {
      collection[entity.id] = entity
    }
  }
  for (const name of attrs) {
    const collection = entities[name]
    for (const item of array) {
      const id = item[name]
      item[name] = collection[id]
    }
  }
  return array
}

export async function joinLog(array) {
  return load(array, ['contact', 'task'])
}

export function clearCache() {
  for (const name in entities) {
    entities[name] = {}
  }
}
