import db, {TaskStatus} from '../database.jsx'
import Skype from './webview.jsx'
import {clear} from '../util/index.jsx'
import {EventEmitter} from 'events'
import {extend, toArray, each} from 'lodash'

extend(Skype.prototype, {
  getProfile() {
    return this.profile
      ? Promise.resolve(this.profile)
      : new Promise((resolve) => this.on('contacts', profile => resolve(profile)))
      .catch(function (err) {
        console.error(err)
      })
  },

  sendMessage(message) {
    this.invoke('sendMessage', [message])
  }
})

function all(array) {
  return new Proxy(array, {
    get(array, p) {
      return function () {
        const args = arguments
        each(array, function (item) {
          item[p].apply(item, args)
        })
      }
    }
  })
}

extend(Skype, {
  get(username) {
    return document.querySelector(`#dark [partition="${username}"]`)
  },

  all(proxy = true) {
    const items = document.querySelectorAll(`#dark [partition]`)
    return proxy ? all(items) : items
  },

  load(data) {
    return new Promise(function (resolve) {
      const skype = Skype.create(data.login)
      skype.once('load', function () {
        skype.login(data.login, data.password)
        skype.once('load', function () {
          skype.login(data.login, data.password)
          skype.once('profile', function (profile) {
            skype.profile = profile
            profile.password = data.password
            clear(profile)
            profile.contacts.forEach(function (contact) {
              ['avatar_url', 'display_name_source', 'name', 'person_id', 'type'].forEach(function (key) {
                delete contact[key]
              })
            })
            api.send('skype/profile', {id: profile.username}, profile)
              .then(function () {
                profile.contacts = profile.contacts.map(c => ({
                  id: profile.username + '~' + c.id,
                  account: profile.username,
                  login: c.id,
                  name: c.display_name,
                  s: TaskStatus.CREATED
                }))
                db.contact
                  .bulkPut(profile.contacts)
                  .then(function () {
                    resolve(skype)
                    skype.emit('contacts', profile)
                  })
                  .catch(function (err) {
                    console.error(err)
                  })
              })
          })
        })
      })
      document.getElementById('dark').appendChild(skype)
    })
  },

  open(data) {
    function _open(data) {
      let skype = Skype.get(data.login)
      if (!skype) {
        const skypes = Skype.all()
        setTimeout(() => skypes.remove(), 10)
        return Skype.load(data)
      }
      return Promise.resolve(skype)
    }

    if ('string' === typeof data) {
      return Skype.getAccount(data)
        .then(_open)
    }
    return _open(data)
  },

  getAccountList(load = true) {
    return load || !Skype.accounts ?
      api.get('skype/accounts').then(accounts => {
        Skype.accounts = accounts
        Skype.emit('accounts', accounts)
        return accounts
      })
      : Promise.resolve(Skype.accounts)
  },

  getAccount(login) {
    function find() {
      return Skype.accounts.find(account => login === account.login)
    }

    return this.accounts
      ? Promise.resolve(find())
      : Skype.getAccountList(false).then(find)
  },

  queryContacts(account) {
    return db.contact
    // .where('account')
    // .equals(this.state.account)
      .filter(contact => account === contact.account)
  },

  close(account) {
    const skype = Skype.get(account)
    if (skype) {
      skype.remove()
    }
    return skype
  },

  closeAll() {
    Skype.all().remove()
  },
});

window.Skype = Skype
module.exports = Skype
