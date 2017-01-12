import {extend, each} from 'lodash'
import Skype from './webview.jsx'

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
    return new Promise(function (resolve, reject) {
      const skype = Skype.create(data.login)
      skype.once('load', function () {
        skype.login(data.login, data.password)
        skype.once('load', function () {
          skype.login(data.login, data.password)
          skype.once('profile', function (profile) {
            profile.login = data.login
            profile.password = data.password
            skype.setProfile(profile).then(resolve, reject)
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

  async getAccountList(load = true) {
    function loadAccountList() {
      return api.get('skype/accounts').then(accounts => {
        Skype.accounts = accounts
        Skype.emit('accounts', accounts)
        return accounts
      })
    }
    return load || !Skype.accounts
      ? loadAccountList()
      : Skype.accounts
  },

  async getAccount(login) {
    function find() {
      return Skype.accounts.find(account => login === account.login)
    }
    if (!this.accounts) {
     await Skype.getAccountList(false)
    }
    return find()
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

  show(visible) {
    document.getElementById('app').style.display = visible ? 'none' : 'block'
    document.getElementById('dark').style.opacity = visible ? '1' : '0'
  }
})

export default Skype
