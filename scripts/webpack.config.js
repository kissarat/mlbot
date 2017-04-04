const fs = require('fs')

const webpack = require('../webpack-common')('scripts', 'update.jsx')

webpack.target = 'node'

module.exports = webpack
