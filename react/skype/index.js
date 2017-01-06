const {extend} = require('lodash')
const {put, getCollection, saveCollection} = require('../database')

const Skype = extend(require('./webview'), {
  get(username) {
    return document.querySelector(`#dark [partition="${username}"]`)
  },

  open(data) {
    let skype = Skype.get(data.login)
    if (!skype) {
      skype = Skype.create(data.login)
      skype.once('load', function () {
        skype.login(data.login, data.password)
        skype.once('load', function () {
          skype.login(data.login, data.password)
          skype.getProfile().then(function (profile) {
            profile.password = data.password
            api.send('skype/profile', {id: profile.username}, profile)
              .then(function () {
                const contacts = profile.contacts.map(c => ({
                  id: profile.username + '~' + c.id,
                  account: profile.username,
                  login: c.id,
                  name: c.display_name
                }))
                const collection = getCollection('contact')
                contacts.forEach(function (contact) {
                  put('contact', contact)
                })
                iterate('contact', function (contact) {
                  if (!contacts.find(c => contact.id === c.id)) {
                    delete collection[contact.id]
                  }
                })
                saveCollection('contact')
                skype.emit('profile.contacts', {account: profile.username})
              })
          })
        })
      })
      skype.on('message', function ({id, status}) {
        table('task')
          .where('id', id)
          .update({status: status})
          .then(function () {
            console.log(id, status)
          })
      })
      document.getElementById('dark').appendChild(skype)
    }
    return skype
  }
})

module.exports = Skype
