import './waiter.jsx'
import './xhr.jsx'
import {$$} from './ui.jsx'
import {extend} from 'lodash'
import {sky} from './sky.jsx'
import {Status} from '../app/config'

// Do not notify user
delete window.Notification
delete window.ServiceWorker
delete window.ServiceWorkerContainer

function insertText(text) {
  document.execCommand('insertText', true, text)
}

function invite(contact) {
  function invited(status) {
    $$('[role=search]').value = ''
    sky.send(extend(contact, {
      type: 'invite',
      status
    }))
  }

  if ('string' === typeof contact) {
    contact = {login: contact}
  }
  waiter('[role=search]', function (input) {
    input.focus()
    input.value = ''
    insertText(contact.login)
    waiter('.searchDirectory', function (button) {
      button.click()
      waiter.fork({
        '.people li[data-title]': () => invited(Status.DOUBLE),
        '.directory [data-bind="text: emptyListText"]': () => invited(Status.ABSENT),

        '.directory li:nth-child(2)' (li) {
          li.click()
          waiter.fork({
            '.contactRequestSend' (contactRequestSend) {
              contactRequestSend.click()
              invited(Status.INVITED)
            },

            '.contactRequestOutgoingMessage ~ .buttonRow button' (button) {
              button.click()
              invited(Status.INVITED)
            },

            '.contactRequestResendMessage': () => invited(Status.DOUBLE),
            '.contactRequestOutgoingMessage': () => invited(Status.DOUBLE)
          })
        },
      })
    })
  })
}

function insertSpaceInterval() {
  if (!insertSpaceInterval.timer) {
    insertSpaceInterval.timer = setInterval(function () {
        const input = $$('[role=search]')
        let text = input.value.trim()
        if (text) {
          input.focus()
          input.value = ''
          if (Math.random() > 0.5) {
            text += ' '
          }
          else {
            text = ' ' + text
          }
          insertText(text)
        }
      },
      2000)
  }
}

function sendMessage(message) {
  $$('swx-search-input button').click()
  // $all('swx-recent-item').forEach(function (item) {
  //   item.remove()
  // })
  waiter('[role=search]', function (input) {
    input.value = ''
    input.focus()
    insertText(message.login)
    waiter(`.searchItem[data-title*="${message.login}"]`, function (button) {
      button.click()
      input.blur()
      waiter('textarea:enabled', function (textarea) {
        // textarea.click()
        // textarea.focus()
        textarea.value = ''
        document.execCommand('insertText', false, message.text)
        textarea.blur()
        setTimeout(function () {
          document.execCommand('insertText', false, message.text)
          textarea.blur()
        }, 1800)
        waiter('.send-button:enabled', function (button) {
          button.click()
          sky.send({
            type: 'message',
            id: message.id,
            status: Status.SEND
          })
        })
      })
    })
  })
}

function login(nick, password) {
  const username = $$('[name=loginfmt]') || $$('[name=username]')
  if (username) {
    username.focus()
    username.value = nick
    document.forms[0].submit()
  }
  waiter('[type=password]', function (passwordInput) {
    passwordInput.value = password
    const checkbox = document.querySelector('[type=checkbox]')
    if (checkbox) {
      checkbox.checked = true
    }
    document.forms[0].submit()
  })
}

function logout() {
  waiter('.Me-sky', function (button) {
    button.click()
    waiter('.signOut', function (button) {
      button.click()
    })
  })
}

function clearData() {
  localStorage.clear()
  const zero = new Date(0).toUTCString()
  document.cookie.split(/;\s*/).forEach(function (s) {
    s = s.split('=')
    document.cookie = s[0] + `=; path=/; expires=${zero}`
  })
}

function openSettings() {
  $$('#menuItem-userSettings').click()
}

addEventListener('load', function () {
  sky.send({type: 'load'})
})

export {
  login,
  logout,
  invite,
  sendMessage,
  clearData,
  insertText,
  openSettings,
  insertSpaceInterval
}

extend(window, exports)
