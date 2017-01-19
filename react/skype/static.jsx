import {extend, each} from 'lodash'
import Skype from './webview.jsx'
import {operationTimeout} from '../util/index.jsx'
import App from '../app/index.jsx'

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

  load(data, busy) {
    return new Promise(function (resolve, reject) {
      const skype = Skype.create(data.login)
      skype.once('login.error', reject)
      skype.onMany(3, 'load', function (number) {
        if (0 === number) {
          setTimeout(function () {
              if (0 === skype.src.indexOf('https://login.live.com/ppsecure/')) {
                reject({kind: 'password'})
              }
              else {
                skype.confirmIdentity()
                  .then(() => reject({kind: 'confirm'}))
              }
              // else if (skype.src.indexOf('https://account.live.com/identity/confirm')) {
              //   reject({kind: 'confirm'})
              // }
            },
            2000)
        }
      })

      function emitStage(stage) {
        try {
          skype.emit('login', {stage})
        }
        catch (ex) {
          console.error(ex)
        }
      }

      function informAppLoginStage({stage}) {
        const stages = {
          username: 'ввод логина',
          password: 'ввод пароля',
          profile: 'профиль получен',
          contacts: 'обновления контактов',
          finishing: 'завершение',
          finish: 'завершено',
        }
        if ('finish' === stage) {
          skype.removeEventListener('login', informAppLoginStage)
        }
        stage = stages[stage] || 'неизвестное состояние'
        App.setBusy('Вход в Skype: ' + stage)
      }

      if (busy) {
        App.setBusy('Вход в Skype: загрука')
        skype.on('login', informAppLoginStage)
      }

      const start = Date.now()
      const timer = operationTimeout(function (err) {
          err.message += ' со времени начала входа в скайп ' + data.login
          err.login = data.login
          if (busy) {
            App.setBusy(false)
          }
          reject(err)
        },
        skypeTimeout)
      skype.once('profile', () => emitStage('profile'))
      skype.once('load', function () {
        emitStage('username')
        skype.login(data.login, data.password)
        skype.once('load', function () {
          emitStage('password')
          skype.login(data.login, data.password)
          skype.once('profile', () => emitStage('profile'))
          skype.once('contacts', function (profile) {
            emitStage('contacts')
            const loaded = Date.now()
            const spend = loaded - start
            console.log(data.login + ` loaded ${profile.contacts.length} contacts after ${spend / 1000} seconds`)
            profile.login = data.login
            profile.password = data.password
            profile.spend = spend
            skype.setProfile(profile)
              .then(function () {
                emitStage('finishing')
                // console.log(profile.login + ` updated contacts after ${(Date.now() - loaded) / 1000} seconds`)
                clearTimeout(timer)
                resolve(skype)
                emitStage('finish')
              })
          })
        })
      })
      document.getElementById('dark').appendChild(skype)
    })
  },

  open(data, busy) {
    function _open(data) {
      let skype = Skype.get(data.login)
      if (!skype) {
        const skypes = Skype.all()
        setTimeout(() => skypes.remove(), 50)
        return Skype.load(data, busy)
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
