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
  // append() {
  //   return map(labels, (label, role) => new MenuItem({role, label}))
  // },
  append() {
    return [new MenuItem({role: 'selectall', label: 'Выделить всё'})]
  },
  labels
})

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
