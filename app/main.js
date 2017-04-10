const path = require('path')
const {app, BrowserWindow, MenuItem} = require('electron')
const config = require('./config')

const labels = {
  selectall: 'Выделить всё',
  cut: 'Вырезать',
  copy: 'Копировать',
  paste: 'Вставить',
}

require('electron-context-menu')({
  showInspectElement: config.dev,
  append() {
    return [new MenuItem({role: 'selectall', label: 'Выделить всё'})]
  },
  labels
})
/*
switch (process.platform) {
  case 'darwin':
    config.window.icon = __dirname + '/images/bitcoin.icns'
    break;

  case 'win32':
    config.window.icon = __dirname + '/images/bitcoin.ico'
    break;
}
*/
BrowserWindow.prototype.loadFile = function (path) {
  return this.loadURL(`file://${__dirname}${path}`, {
    userAgent: 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
  })
}

app.on('ready', function () {
  const win = new BrowserWindow(config.window)
  // if ('win32' === process.platform) {
  //   win.setOverlayIcon(config.window.icon, 'Application')
  // }
  win.loadFile('/index.html')
  win.webContents.on('did-finish-load', function () {
    win.webContents.send('config', {
      userDataPath: app.getPath('userData')
    })
  })
  if (config.dev) {
    win.webContents.openDevTools()
    // BrowserWindow.addDevToolsExtension(__dirname + '/../extensions/react')
    // BrowserWindow.addDevToolsExtension(__dirname + '/../extensions/imacros')
  }
})

app.on('window-all-closed', () => {
  app.quit()
})
