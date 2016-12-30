require('./js/ui')
const WebView = require('./js/webview')
const api = require('./js/api')
const {ipcRenderer} = require('electron')
const {initDatabase, table, raw} = require('./js/sqlite')
const config = require('./js/config')

const expires = new Date()
expires.setMonth(expires.getMonth() + 6)
api.send('handshake/' + Date.now(), {type: 'app', expires: expires.toISOString()})
  .then(function (config) {
    api.setToken(config.token.id)
    main(config)
  })

function run() {
  return raw(`
  UPDATE task_view SET status = 1 WHERE id =
  (SELECT min(id) FROM task_view WHERE status = 0)
  RETURNING id, account, login, text
`)
    .then(function (task) {

    })
}

function main(config) {
  initDatabase().then(function () {
    if (config.user.guest) {
      $id('root').place('#login').$$('form').init({
        submit(inData) {
          api.send('user/login/' + inData.email, inData)
            .then(function (outData) {
              if (outData.success) {
                appLayout()
              }
            })
        }
      })
    }
    else {
      appLayout()
    }
    return run()
  })
    .catch(function (err) {
      console.error(err)
    })
}

function appLayout() {
  api.get('skype/accounts').then(function (accounts) {
    $id('root')
      .place('#app-layout')
      .$$('aside ul')
      .fragment(accounts.map(function (a) {
        const li = $new('li')
        li.innerHTML = a.login
        li.addEventListener('click', function () {
          openSkype(a).getProfile().then(function (profile) {
            $id('tab').place('#contacts').$$('table').update(profile.contacts.map(o => ({
              _id: `${a.username}-${o.id}`,
              username: o.id,
              display_name: o.display_name
            })))
          })
        })
        return li
      }))
    bar({
      addSkype: skypeLogin
    })
    $id('main').place('#tabs-layout')
  })
}

function skypeLogin() {
  $id('main').place('#skype-login').init({
    submit: openSkype
  })
}

function getSkype(login) {
  return $$(`#dark [partition="${login}"]`)
}

function openSkype(data) {
  let skype = getSkype(data.login)
  if (!skype) {
    skype = WebView.create(data.login)
    skype.once('load', function () {
      skype.login(data.login, data.password)
      skype.once('load', function () {
        skype.login(data.login, data.password)
        skype.getProfile().then(function (profile) {
          $$('aside ul').add('li', profile.username)
          profile.password = data.password
          api.send('skype/profile', {id: profile.username}, profile)
        })
      })
    })
    skype.on('message', function ({id, status}) {
      table('task')
        .where('id', id)
        .update({status: status})
        .then(function () {
          console.log(id, status)
        })
    })
    $id('dark').appendChild(skype)
  }
  return skype
}

window.showSkype = function (value) {
  if (value) {
    $id('dark').style.opacity = 1
    $id('root').hide()
  }
  else {
    $id('root').show()
  }
}

window.errorPage = function () {
  $id('root').place('#error')
}
