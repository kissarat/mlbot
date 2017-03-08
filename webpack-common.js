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
          test: /\.json$/,
          loader: "json-loader"
        },
        {
          test: /\.jsx$/,
          exclude: /(node_modules)/,
          loader: 'babel',
          query: {
            presets: ['es2017', 'es2015', 'react'],
            plugins: [
              'transform-regenerator',
              'transform-class-properties'
            ]
          }
        },
        // {
        //   test: /\.(svg)$/,
        //   loader: "url-loader"
        // },
        // {
        //   test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        //   loader: "url-loader?limit=10000&minetype=application/font-woff"
        // },
        // {
        //   test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        //   loader: "file-loader"
        // },
        {
          test: /\.css$/,
          loaders: [{
            loader: "style-loader" // creates style nodes from JS strings
          }, {
            loader: "css-loader" // translates CSS into CommonJS
          },
            // {
          //   loader: "sass-loader" // compiles Sass to CSS
          // }
          ]
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
