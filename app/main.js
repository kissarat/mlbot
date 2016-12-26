const {app, Tray, Menu, BrowserWindow} = require('electron')
const path = require('path')
const config = require('./js/config')

BrowserWindow.prototype.loadFile = function (path) {
  return this.loadURL(`file://${__dirname}${path}`)
}

const iconPath = path.join(__dirname, 'images/icon.png')
let appIcon = null
let win = null

app.on('ready', function () {
  win = new BrowserWindow(config.window)
  win.loadFile('/index.html')
  if (config.dev) {
    win.openDevTools()
  }
})
