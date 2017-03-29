const os = require('os')
const fs = require('fs')
const path = require('path')

console.log(os.tmpdir())
fs.writeFileSync(path.join(os.tmpdir(), 'one.txt'), 'hello')
