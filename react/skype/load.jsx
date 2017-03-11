import App from '../app/index.jsx'
import Timeout from '../util/timeout.jsx'

export default function load(data) {
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
      console.log(`${data.login} stage ${stage}`)
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

    if (data.busy) {
      App.setBusy('Вход в Skype: загрузка')
      skype.on('login', informAppLoginStage)
    }

    // const timeout = Object.create(Timeout)
    // timeout.timeout = skypeTimeout
    // console.log(timeout.timeout)
    // Timeout.setTimeout(function () {
    //   const err = {
    //     toString() {
    //       return 'Время вышло'
    //     }
    //   }
    //   if (busy) {
    //     App.setBusy(false)
    //   }
    //   reject(err)
    // })

    skype.once('profile', () => emitStage('profile'))
    skype.once('token', function ({headers}) {
      skype.headers = headers
      // timeout.clearTimeout()
      // timeout.clearTimeout()
      console.log('headers received')
      resolve(skype)
    })

    skype.once('load', function () {
      emitStage('username')
      // timeout.updateTimeout()
      skype.login(data.login, data.password)
      skype.once('load', function () {
        emitStage('password')
        // timeout.updateTimeout()
        skype.login(data.login, data.password)
      })
    })
    document.getElementById('dark').appendChild(skype)
  })
}