module.exports = {
  dev: true,
  reset: false,
  origin: 'http://mac.ternopil.ru',
  window: {
    minWidth: 640,
    minHeight: 480,
    width: 1080,
    x: 0
  },
  message: {
    type: {
      PLAIN: 0,
      INVITE: 1
    }
  },
  task: {
    status: {
      CREATED: 0,
      INVITED: 1,
      SEND: 2
    }
  }
}
