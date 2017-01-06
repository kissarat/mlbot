import {debounce, each, find} from 'lodash'

const data = {}

const initialData = {
  contact: {},
  message: {}
}

addEventListener('load', function () {
  each(initialData, function (value, key) {
    try {
      data[key] = JSON.parse(localStorage.getItem(key))
    }
    catch (ex) {
      data[key] = value
    }
  })
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

export function saveCollection(name) {
  localStorage.setItem(name, JSON.stringify(data[name]))
}

addEventListener('unload', function () {
  Object.keys(data).forEach(saveCollection)
})

export function put(name, record) {
  data[name][record.id] = record
  debounce(() => saveCollection(name), 30)
}

export function findOne(name, predicate) {
  return find(data[name], predicate)
}

export function findById(name, id) {
  const c = data[name]
  for (const key in c) {
    const value = c[key]
    if (id == value) {
      return value
    }
  }
}

export function replaceCollection(name, collection) {
  if (collection instanceof Array) {
    const c = {}
    collection.forEach(function (item) {
      c[item.id] = item
    })
    collection = c
  }
  data[name] = collection
  saveCollection(name)
}

export function removeCollection(name) {
  delete data[name]
  localStorage.removeItem(name)
}
