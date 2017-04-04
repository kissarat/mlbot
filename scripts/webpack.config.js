const fs = require('fs')

const webpack = require('../webpack-common')('scripts', 'update.js')

webpack.target = 'node'

const dirs = fs.readdirSync(__dirname + '/../node_modules')

webpack.externals = dirs
    .filter(x => x !== '.bin')
    .reduce((a, n) => (a[n] = 'commonjs ' + n) && a, {})

module.exports = webpack
