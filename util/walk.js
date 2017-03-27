const fs = require('fs')
const {join} = require('path')

function walk(path, visitor = () => true) {
  const files = fs.readdirSync(path)
  const o = {}
  for(const name of files) {
    const filename = join(path, name)
    const stat = fs.lstatSync(filename)
    if (visitor(filename, stat)) {
      if (stat.isDirectory()) {
        o[name] = walk(filename, visitor)
      }
      else {
        o[name] = stat.size
      }
    }
  }
  return o
}

module.exports = walk
