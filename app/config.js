module.exports = {
  dev: true,
  reset: false,
  origin: 'http://mac.ternopil.ru',
  window: {
    minWidth: 640,
    minHeight: 480,
    width: 1080,
    height: 960,
    x: 0
  },
  TaskStatus: {
    CREATED: 0,
    SELECTED: 1,
    PROCESSING: 2,
    INVITED: 3,
    SEND: 4
  }
}
