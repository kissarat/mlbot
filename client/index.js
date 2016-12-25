require('./waiter')
const {extend} = require('lodash')

function addContact(loginName) {
  waiter('[role=search]', function (input) {
    input.focus()
    sky.paste(loginName)
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
  // $all('.searchItem').forEach(function (item) {
  //   item.remove()
  // })
  waiter('[role=search]', function (input) {
    input.value = ''
    input.focus()
    document.execCommand('insertText', true, loginName)
    input.blur()
    waiter(`.searchItem[data-title*="${loginName}"]`, function (button) {
      button.click()
      waiter('textarea', function (textarea) {
        textarea.focus()
        document.execCommand('insertText', false, text)
        textarea.blur()
        textarea.click()
        waiter('.send-button:enabled', function (button) {
          button.click()
        })
      })
    })
  })
}

function login(nick, password) {
  waiter('[name=loginfmt]', function (login) {
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

extend(window, {login, logout, addContact, sendMessage})
