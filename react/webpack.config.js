const fs = require('fs')

const webpack = require('../webpack-common')('react')
webpack.target = 'node'

var nodeModules = {};
fs.readdirSync(__dirname + '/../app/node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

webpack.externals = nodeModules

module.exports = webpack
