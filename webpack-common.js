// const webpack = require('webpack')

const _mode = (process.env.MLBOT || '').split(',')
function mode(name) {
  return _mode.indexOf(name) >= 0
}

module.exports = function (name) {
  const config = {
    entry: [`${__dirname}/${name}/index.jsx`],
    output: {
      path: __dirname + '/app/js',
      filename: name + '.js',
    },
    module: {
      loaders: [
        {
          test: /\.json$/,
          loader: "json-loader"
        },
        {
          test: /\.jsx$/,
          exclude: /(node_modules)/,
          loader: 'babel-loader',
          query: {
            presets: [
              // 'es2017',
              // 'es2015',
              'react'
            ],
            plugins: [
              // 'transform-regenerator',
              'transform-class-properties',
              'transform-object-rest-spread'
            ]
          }
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
    // modules: [
    //   __dirname + '/app/node_modules'
    // ],
    resolve: {
      // modulesDirectories: [__dirname + '/app/node_modules']
    },
    plugins: [
      //   new webpack.DefinePlugin({
      //     MLBOT_VENDOR: JSON.stringify(process.env.MLBOT_VENDOR || 'club-leader')
      //   })
    ]
  }

  if (mode('dev')) {
    config.devtool = 'source-map'
  }

  if (mode('prod')) {
    const Uglify = require('webpack-uglify-js-plugin')
    config.plugins.push(new Uglify({
      cacheFolder: '/tmp',
      debug: false,
      minimize: true,
      sourceMap: false,
      compress: {
        warnings: true
      },
      output: {
        comments: false
      }
    }))
  }

  return config
}
