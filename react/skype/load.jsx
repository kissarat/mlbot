import App from '../app/index.jsx'
import Contact from '../entity/contact.jsx'
import {operationTimeout} from '../util/index.jsx'

export default function load(data, busy) {
  return new Promise(function (resolve, reject) {
    const skype = Skype.create(data.login)
    skype.once('login.error', reject)
    skype.onMany(3, 'load', function (number) {
      if (0 === number) {
        setTimeout(function () {
            if (0 === skype.src.indexOf('https://login.live.com/ppsecure/')) {
              reject({kind: 'password'})
            }
            else if (/account\.live\.com\/Abuse/.test(skype.src)) {
              reject({kind: 'abuse'})
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
      App.setBusy('Вход в Skype: загрузка')
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
              Contact.emit('update')
              skype.emit('updated')
            })
        })
      })
    })
    document.getElementById('dark').appendChild(skype)
  })
}
