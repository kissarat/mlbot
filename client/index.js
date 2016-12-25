require('./waiter')
const {extend} = require('lodash')

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

function sendMessage(loginName, text) {
  $$('swx-search-input button').click()
  // $all('swx-recent-item').forEach(function (item) {
  //   item.remove()
  // })
  waiter('[role=search]', function (input) {
    input.value = ''
    input.focus()
    document.execCommand('insertText', true, loginName)
    waiter(`.searchItem[data-title*="${loginName}"]`, function (button) {
      button.click()
      input.blur()
      waiter('textarea:enabled', function (textarea) {
        // textarea.click()
        // textarea.focus()
        textarea.value = ''
        document.execCommand('insertText', false, text)
        textarea.blur()
        setTimeout(function () {
          document.execCommand('insertText', false, text)
          textarea.blur()
        }, 1800)
        waiter('.send-button:enabled', function (button) {
          button.click()
        })
      })
    })
  })
}

function login(nick, password) {
  const login = $$('[name=loginfmt]') || $$('[name=username]')
  login.focus()
  login.value = nick
  // idSIButton9.click()
  document.forms[0].submit()
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

extend(window, {login, logout, addContact, sendMessage, clearData})
