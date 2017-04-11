import waiter from './waiter.jsx'
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

function resetSearch() {
  $$('.searchReset').click()
}

HTMLInputElement.prototype.paste = function (text, clear) {
  if (clear) {
    this.value = ''
  }
  this.focus()
  document.execCommand('insertText', true, text)
}

function insertTextIntoInput(input, text) {
  if ('string' === typeof input) {
    input = $$(input)
  }
  input.focus()
  input.value = ''
  insertText(text)
}

function sendMessage(message) {
  // $$('swx-search-input button').click()
  // $all('swx-recent-item').forEach(function (item) {
  //   item.remove()
  // })
  openSettings()
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
            status: Status.DONE
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
  waiter.fork({
    '[type=password]' (passwordInput) {
      passwordInput.value = password
      const checkbox = document.querySelector('[type=checkbox]')
      if (checkbox) {
        checkbox.checked = true
      }
      document.forms[0].submit()
    },

    '#usernameError' () {
      sky.send({
        type: 'login.error',
        kind: 'username'
      })
    },

    '#passwordError' () {
      sky.send({
        type: 'login.error',
        kind: 'password'
      })
    },
    /*
     '.serviceAbusePageContainer' () {
     sky.send({
     type: 'login.error',
     kind: 'abuse'
     })
     }
     */
  })
}

function waitSelector(selector) {
  waiter(selector, function () {
    sky.send({type: selector})
  })
}

function confirmIdentity() {
  waiter('.confirmIdentity', function () {
    sky.send({type: 'confirm'})
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
  const welcome = $$('.btn.green.narrow.large.close')
  if (welcome instanceof Element) {
    welcome.click()
  }
  $$('#menuItem-userSettings').click()
}

function invite(contact) {
  if ('string' === typeof contact) {
    contact = {login: contact}
  }
  waiter('[role=search]', function (input) {
    function _invited(status) {
      // input.focus()
      resetSearch()
      sky.send(extend(contact, {
        type: 'invite',
        status
      }))
    }

    resetSearch()
    input.paste(contact.login, true)
    waiter('.searchDirectory', function (button) {
      button.click()
      waiter.fork({
        '.directory [data-bind*="emptyListText"]'() {
          _invited(Status.ABSENT)
        },

        // .people li[data-title]
        [`.searchItem[data-title*="${contact.login}"]`](contactItem) {
          contactItem.click()
          waiter.fork({
            '.contactRequestSend  |  .contactRequestOutgoingMessage ~ .buttonRow button'(button) {
              button.click()
              _invited(Status.DONE)
            },

            '.contactRequestResendMessage  |  .contactRequestOutgoingMessage'() {
              _invited(Status.CONFLICT)
            }
          })
        }
      })
    })
  })
}

addEventListener('load', function () {
  sky.send({type: 'load'})
})

const _exports = {
  clearData,
  insertText,
  insertTextIntoInput,
  login,
  logout,
  openSettings,
  sendMessage,
  waitSelector,
  confirmIdentity,
  invite
}

extend(sky, {
  sendMessage,
  invite
})

extend(window, _exports)

export default _exports
