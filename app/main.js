const {app, nativeImage, BrowserWindow} = require('electron')
const path = require('path')
const config = require('./js/config')
const {defaults} = require('lodash')

BrowserWindow.prototype.loadFile = function (path) {
  return this.loadURL(`file://${__dirname}${path}`)
}

const iconPath = path.join(__dirname, 'images/icon.png')
let appIcon = null
let win = null

app.on('ready', function () {
  const windowConfig = defaults(config.window, {
    icon: nativeImage.createFromPath(__dirname + '/images/bitcoin.png')
  })
  win = new BrowserWindow({
    icon: nativeImage.createFromPath(__dirname + '/images/bitcoin.png')
  })
  win.setOverlayIcon(windowConfig.icon, 'MLBot')
  win.loadFile('/index.html')
  if (config.dev) {
    win.openDevTools()
  }
})
