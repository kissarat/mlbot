const {debounce, each, find} = require('lodash')

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

const MessageType = Object.freeze({
  PLAIN: 0,
  INVITE: 1
})

const TaskStatus = Object.freeze({
  CREATED: 0,
  PROCESSING: 1,
  INVITED: 2,
  SEND: 3
})

function saveCollection(name) {
  localStorage.setItem(name, JSON.stringify(data[name]))
}

addEventListener('unload', function () {
  Object.keys(data).forEach(saveCollection)
})

function put(name, record) {
  data[name][record.id] = record
  debounce(() => saveCollection(name), 30)
}

function findOne(name, predicate) {
  return find(data[name], predicate)
}

function getCollection(name) {
  return data[name]
}

function replaceCollection(name, collection) {
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

function removeCollection(name) {
  delete data[name]
  localStorage.removeItem(name)
}

function iterate(name, fn) {
  const c = data[name]
  for(const key in c) {
    if (fn.call(c, c[key])) {
      return
    }
  }
}

module.exports = {
  MessageType, TaskStatus, put, findOne, iterate,
  getCollection, saveCollection, replaceCollection, removeCollection
}
