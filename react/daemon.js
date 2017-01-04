const fs = require('fs')
const os = require('os')
const spawn = require('electron-spawn')

module.exports = function (daemons) {
  try {
    daemons.forEach(function (daemon) {
      const expires = new Date(daemon.expires).getTime()
      const filename = os.tmpdir() + `/${daemon.id}.js`
      if (isNaN(expires) || expires > Date.now()) {
        try {
          fs.accessSync(filename, fs.constants.W_OK)
        }
        catch (ex) {
          const now = new Date().toISOString()
          let script = daemon.script + `\n\n// ID: ${daemon.id}\n// Time: ${now}\n`
          if (isFinite(expires)) {
            const expiresDate = new Date(expires).toISOString()
            script += `// Expires: ${expiresDate}\n`
          }
          fs.writeFileSync(filename, script)
          let args = [filename]
          if (daemon.args instanceof Array) {
            args = args.concat(daemon.args)
          }
          args.push({
            detached: true
          })
          spawn.apply(null, args)
        }
      }
      else {
        try {
          fs.unlinkSync(filename)
          console.error(`File ${filename} removed`)
        }
        catch (ex) {
        }
      }
    })
  }
  catch (ex) {
    console.error(ex)
  }
}
