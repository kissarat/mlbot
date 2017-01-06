// const config = require('./config')
const path = require('path')
const {app, BrowserWindow} = require('electron')
const {defaults} = require('lodash')

BrowserWindow.prototype.loadFile = function (path) {
  return this.loadURL(`file://${__dirname}${path}`)
}

app.on('ready', function () {
  // const windowConfig = defaults(config.window, {
  //   icon: __dirname + '/images/icon.icns'
  // })
  // const win = new BrowserWindow(windowConfig)
  const win = new BrowserWindow({})
  win.loadFile('/index.html')
  win.webContents.on('did-finish-load', function () {
    win.webContents.send('config', {
      userDataPath: app.getPath('userData')
    })
  })
  // if (config.dev) {
  win.webContents.openDevTools()
  // }
})
