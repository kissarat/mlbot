function multi(object) {
  if (object instanceof Array) {
    object = {tasks: object}
  }
  const {threads = 1, tasks, success, error, delay = 0} = object
  return new Promise(function (resolve, reject) {
    let i = 0
    function iterate() {
      if (i < tasks.length) {
        tasks[i++]()
          .then(function (result) {
            if ('function' === typeof success) {
              success(result)
            }
            iterate()
          })
          .catch(function (err) {
            if ('function' === typeof error) {
              error(err)
            }
            iterate()
          })
          .catch(reject)
      }
      else {
        resolve()
      }
    }
    for (let j = 0; j < threads; j++) {
      setTimeout(iterate, j * delay)
    }
  })
}

module.exports = function (skype) {
  function accept(account, nick) {
    return new Promise(function (resolve, reject) {
      const url = `https://api.skype.com/users/self/contacts/auth-request/${nick}/accept`
      const requestParams = {
        headers: {
          'X-Skypetoken': account.skypeToken
        }
      }
      skype.requestService.requestWithJar.put(url, requestParams, function (err, res, body) {
        if (err || res.statusCode >= 400) {
          reject(err || res)
        }
        else {
          resolve(JSON.parse(body))
        }
      })
    })
  }

  function send(account, id, content) {
    return new Promise(function (resolve, reject) {
      const url = `https://client-s.gateway.messenger.live.com/v1/users/ME/conversations/${id}/messages`
      const requestParams = {
        body: JSON.stringify({
          content,
          messagetype: 'RichText',
          contenttype: 'text'
        }),
        headers: {
          RegistrationToken: account.registrationTokenParams.raw
        }
      }
      skype.messageService.requestWithJar.post(url, requestParams, function (err, res, body) {
        if (err || res.statusCode >= 400) {
          reject(err || res)
        }
        else {
          resolve(JSON.parse(body))
        }
      })
    })
  }

  return {
    multi,
    accept,
    send
  }
}
