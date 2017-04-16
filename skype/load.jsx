import App from '../ui/app/index.jsx'
import api from '../connect/api.jsx'
import {pick, random} from 'lodash'

export default function load(data) {
  return new Promise((resolve, reject) => {
    const skype = this
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
      console.log(`${data.id} stage ${stage}`)
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
      resolve(skype)
    })

    skype.once('load', function () {
      emitStage('username')
      // timeout.updateTimeout()
      skype.login(data.id, data.password)
      skype.once('load', function () {
        emitStage('password')
        // timeout.updateTimeout()
        skype.login(data.id, data.password)
      })
    })
    skype.updatedConversations = []
    skype.on('messages', function (r) {
      // for(const message of r.messages) {
      //   if (!message.to) {
      //     message.to = data.id
      //   }
      // }
      skype.updatedConversations.push(r)
    })
    function sendMessages(r) {
      if (!r.account) {
        r.account = data.id
      }
      return api.send('skype/messages', pick(r, 'account', 'chat'), r.messages)
    }
    setInterval(function () {
      const r = skype.updatedConversations.shift()
      if (r) {
        setTimeout(sendMessages, random(0, 1000), r)
      }
    }, 1000)
    document.getElementById('dark').appendChild(skype)
  })
}
