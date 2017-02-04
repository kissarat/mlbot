const path = require('path')
const {app, BrowserWindow} = require('electron')
const config = require('./config')

BrowserWindow.prototype.loadFile = function (path) {
  return this.loadURL(`file://${__dirname}${path}`)
}

app.on('ready', function () {
  const win = new BrowserWindow(config.window)
  win.loadFile('/index.html')
  win.webContents.on('did-finish-load', function () {
    win.webContents.send('config', {
      userDataPath: app.getPath('userData')
    })
  })
  if (config.dev) {
    win.webContents.openDevTools()
  }
})

app.on('window-all-closed', () => {
  app.quit()
})
