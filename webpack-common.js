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
      comments: false
    },
    module: {
      loaders: [
        {
          test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: "url-loader?limit=10000&minetype=application/font-woff"
        },
        {
          test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: "file-loader"
        },
        {
          test: /\.json$/,
          loader: "json-loader"
        },
        {
          test: /\.jsx$/,
          exclude: /(node_modules)/,
          loader: 'babel',
          query: {
            presets: ['es2015', 'es2017', 'react'],
            plugins: ['transform-class-properties']
          }
        }
      ]
    },
    resolve: {
      modulesDirectories: [__dirname + '/app/node_modules']
    },
    plugins: []
  }

  if (mode('dev')) {
    config.devtool = 'source-map'
  }

  if (mode('prod')) {
    let Uglify
    try {
      Uglify = require('webpack-uglify-js-plugin')
    }
    catch (ex) {
      console.error('Cannot import webpack-uglify-js-plugin')
    }

    if (Uglify) {
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
  }

  return config
}
