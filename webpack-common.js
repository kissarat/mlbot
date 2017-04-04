const config = require('./app/config')
const os = require('os')
const package_json = require('./app/package.json')
const path = require('path')
const webpack = require('webpack')
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
const {map, pick} = require('lodash')

const _mode = (process.env.MLBOT || '').split(',')
function mode(name) {
  return _mode.indexOf(name) >= 0
}

const babel = {
  test: /\.jsx$/,
  exclude: /(node_modules)/,
  loader: 'babel-loader',
  query: {
    presets: ['react'],
    plugins: [
      'transform-class-properties',
      'transform-object-rest-spread',
    ]
  }
}

module.exports = function (name, filename) {
  const dest = path.join(__dirname, name)
  const config = {
    entry: [
      // 'babel-polyfill',
      // 'babel-core/register',
      path.join(dest, filename || 'index.jsx')
    ],
    output: {
      path: filename ? dest : path.join(__dirname, 'app', 'js'),
      filename: filename ? filename.replace(/\.jsx?$/, '.out.js') : name + '.js',
    },
    module: {
      loaders: [
        babel,
        {
          test: /\.json$/,
          loader: "json-loader"
        },
        {
          test: /\.css$/,
          loaders: [{
            loader: "style-loader"
          }, {
            loader: "css-loader"
          },
          ]
        },
      ]
    },
    resolve: {},
    plugins: []
  }

  if (mode('dev')) {
    config.devtool = 'source-map'
  }

  if (mode('usage')) {
    config.plugins.push(new BundleAnalyzerPlugin({
      analyzerMode: 'server',
      analyzerHost: '127.0.0.1',
      analyzerPort: 8888,
    }))
  }

  if (mode('prod')) {
    babel.query.plugins.push('transform-runtime')
    babel.query.presets.push('es2015', 'es2017')

    config.plugins.push(
        new webpack.DefinePlugin({
          'process.env': {
            'NODE_ENV': JSON.stringify('production'),
            'MLBOT_VENDOR': JSON.stringify(process.env.MLBOT_VENDOR || config.vendor)
          }
        }),
        new webpack.optimize.CommonsChunkPlugin({
          children: true,
          async: true,
        }),
        new webpack.optimize.UglifyJsPlugin({
          cacheFolder: os.tmpdir(),
          debug: false,
          minimize: true,
          sourceMap: false,
          beautify: false,
          comments: false,
          compress: {
            sequences: true,
            booleans: true,
            loops: true,
            unused: true,
            warnings: false,
            drop_console: true,
            unsafe: true,
          },
          output: {
            comments: false
          }
        })
    )

    if (!filename) {
      config.plugins.push(new webpack.BannerPlugin({
        banner: map(pick(package_json, 'name', 'version', 'homepage', 'email', 'author'), (v, k) => `@${k} ${v}`).join('\n'),
        entryOnly: false
      }))
    }
  }

  return config
}
