require('./waiter')
const {extend} = require('lodash')

function addFriend(loginName) {
  waiter('[role=search]', function (input) {
    input.focus()
    input.value = loginName
    input.keypress('Enter', 13)
    waiter('.searchDictionary', function (button) {
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

function login(loginName, password) {
  waiter({
    form: '#i0281',
    email: '[type=email]'
  }, function ({form, email}) {
    email.value = loginName
    form.submit()
  })
  waiter({
    form: '#i0281',
    password: '[type=password]',
    remember: '[name=KMSI]'
  }, function ({form, password, remember}) {
    password.value = ''
    password.value = password
    remember.checked = true
    form.submit()
  })
}

function logout() {
  waiter('.Me-sky', function (button) {
    button.click()
    waiter('.Me-linkText', function (button) {
      button.click()
    })
  })
}

extend(window, {addFriend, login, logout})
