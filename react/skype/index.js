const {extend, toArray} = require('lodash')
const {put, iterate, getCollection, saveCollection} = require('../database')
const {clear} = require('../util')

const Skype = require('./webview')

extend(Skype.prototype, {
  getProfile() {
    return this.profile
      ? Promise.resolve(this.profile)
      : new Promise(resolve => this.once('profile', profile => {
        this.profile = profile
        clear(profile)
        profile.contacts.forEach(function (contact) {
          ['avatar_url', 'display_name_source', 'name', 'person_id', 'type'].forEach(function (key) {
            delete contact[key]
          })
        })
        resolve(profile)
      })
    )
      .catch(function (err) {
        console.error(err)
      })
  },

  sendMessage(message) {
    this.invoke('sendMessage', [message])
  }
})

extend(Skype, {
  get(username) {
    return document.querySelector(`#dark [partition="${username}"]`)
  },

  all() {
    return toArray(document.querySelectorAll(`#dark [partition]`))
  },

  on(event, callback) {
    Skype.all().forEach(function (skype) {
      skype.on(event, callback)
    })
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
      document.getElementById('dark').appendChild(skype)
    }
    return skype
  }
})

module.exports = Skype
