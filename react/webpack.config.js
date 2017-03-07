const fs = require('fs')

const webpack = require('../webpack-common')('react')
webpack.target = 'node'

const dirs = fs.readdirSync(__dirname + '/../node_modules')

webpack.externals = dirs
  .filter(x => x !== '.bin')
  .reduce((a, n) => (a[n] = 'commonjs ' + n) && a, {})

webpack.resolve.extensions = ['.ts', '.tsx', '.js']

webpack.module.loaders.push({
  test: /\.tsx?$/,
  loader: 'ts-loader'
})

// webpack.externals['config'] = '../app/config'

module.exports = webpack
