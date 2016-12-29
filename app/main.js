const {app, nativeImage, BrowserWindow} = require('electron')
const path = require('path')
const config = require('./js/config')
const {defaults} = require('lodash')
const sqlite = require('./js/sqlite')

BrowserWindow.prototype.loadFile = function (path) {
  return this.loadURL(`file://${__dirname}${path}`)
}

const iconPath = path.join(__dirname, 'images/icon.png')
let appIcon = null
let win = null

app.on('ready', function () {
  const windowConfig = defaults(config.window, {
    icon: __dirname + '/images/icon.icns'
  })
  win = new BrowserWindow(windowConfig)
  win.loadFile('/index.html')
  win.webContents.on('did-finish-load', function () {
    win.webContents.send('config', {
      userDataPath: app.getPath('userData')
    })
  })
  if (config.dev) {
    win.openDevTools()
  }
})
