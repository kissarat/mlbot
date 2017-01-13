module.exports = {
  dev: true,
  reset: false,
  origin: 'http://sam.ternopil.ru',
  window: {
    minWidth: 640,
    minHeight: 480,
    width: 1080,
    height: 960,
    x: 0
  },
  Status: Object.freeze({
    FORBIDDEN: -2,
    ABSENT: -1,

    CREATED: 0,
    SELECTED: 1,
    PROCESSING: 2,
    INVITED: 3,
    SENT: 4,
    DOUBLE: 5,
  })
}
