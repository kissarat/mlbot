const {app, Tray, Menu, BrowserWindow} = require('electron')
const path = require('path')
const Skype = require('skyweb')
const skype = new Skype()
skype.login('kissarat', 'tX*82yU#1+')
  .then(function (account) {
    return skype.contactsService.loadContacts(account, function (a, b, c) {
      console.log(b, c)
    })
  })
  .catch(function (err) {
    console.error(err)
  })

BrowserWindow.prototype.loadFile = function (path) {
  return this.loadURL(`file://${__dirname}${path}`)
}

const iconPath = path.join(__dirname, 'images/icon.png')
let appIcon = null
let win = null

app.on('ready', function () {
  win = new BrowserWindow({})
  win.loadFile('/skype.html')

  win.webContents.on('did-finish-load', function() {
    console.log(win.webContents.getURL());
  });

  win.openDevTools()
})
