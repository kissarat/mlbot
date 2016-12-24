const {app, Tray, Menu, BrowserWindow} = require('electron')
const path = require('path')
const config = require('./config')

BrowserWindow.prototype.loadFile = function (path) {
  return this.loadURL(`file://${__dirname}${path}`)
}

const iconPath = path.join(__dirname, 'images/icon.png')
let appIcon = null
let win = null

app.on('ready', function () {
  win = new BrowserWindow()
  win.loadFile('/index.html')
  const skype = new BrowserWindow({
    webPreferences: {
      preload: 'file:///one.js',
      webSecurity: false,
      allowRunningInsecureContent: true,
      allowDisplayingInsecureContent: true,
      experimentalFeatures: true,
      sandbox: false
    }
  })
// skype.webContects.executeJavaScript('console.log("hello")')
//   skype.on('did-start-loading', function () {
//     console.log('hello')
//   })

  win.loadURL('http://web.skype.com')

  if (config.dev) {
    skype.openDevTools()
    win.openDevTools()
  }
})
