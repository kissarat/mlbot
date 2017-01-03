const {extend} = require('lodash')

const Skype = {
  get(username) {
    return $$(`#dark [partition="${username}"]`)
  },

  open(data) {
    let skype = Skype.get(data.login)
    if (!skype) {
      skype = WebView.create(data.login)
      skype.once('load', function () {
        skype.login(data.login, data.password)
        skype.once('load', function () {
          skype.login(data.login, data.password)
          skype.getProfile().then(function (profile) {
            //$$('aside ul').add('li', profile.username)
            profile.password = data.password
            api.send('skype/profile', {id: profile.username}, profile)
              .then(function () {
                const contacts = profile.contacts.map((c, i) => ({
                  id: Date.now() + i,
                  account: profile.username,
                  login: c.id,
                  name: c.display_name
                }))
                table('contact')
                  .insert(contacts)
                  .catch(function (err) {
                    console.error(err)
                  })
              })
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
  },

  show(value) {
    if (value) {
      $id('dark').style.opacity = 1
      $id('root').hide()
    }
    else {
      $id('root').show()
    }
  }
}

module.exports = extend(require('./webview'), Skype)
