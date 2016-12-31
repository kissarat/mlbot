require('./waiter')
const {extend} = require('lodash')
const config = require('../app/js/config')

function addContact(loginName) {
  waiter('[role=search]', function (input) {
    input.focus()
    document.execCommand('insertText', true, loginName)
    waiter('.searchDirectory', function (button) {
      button.click()
      waiter('.directory li:nth-child(2)', function (li) {
        li.click()
        waiter('.contactRequestSend', function (requestButton) {
          requestButton.click()
        })
      })
    })
  })
}

function sendMessage(message) {
  $$('swx-search-input button').click()
  // $all('swx-recent-item').forEach(function (item) {
  //   item.remove()
  // })
  waiter('[role=search]', function (input) {
    input.value = ''
    input.focus()
    document.execCommand('insertText', true, message.login)
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
            status: config.task.status.SEND
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

addEventListener('load', function () {
  sky.send({type: 'load'})
})

extend(window, {login, logout, addContact, sendMessage, clearData})

// a = {LastName: 'Labiak', FirstName: 'Taras', Password: 'password', RetypePassword: 'password', BirthDay: '20', BirthMonth: '9', BirthYear: '1989', Gender: 'm', PhoneCountry: 'UA', PhoneNumber: '671541943', MemberName: 'k.issarat@gmail.com'}; for(const k in a) {document.querySelector(`#${k}`).value = a[k]}
