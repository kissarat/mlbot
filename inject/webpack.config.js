const _mode = (process.env.MLBOT || '').split(',')
function mode(name) {
  return _mode.indexOf(name) >= 0
}

const config = {
  entry: __dirname + '/index.js',
  output: {
    path: __dirname + '/../app/js',
    filename: 'inject.js',
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
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel',
        query: {
          presets: ['es2015', 'react'],
          plugins: ['transform-class-properties']
        }
      }
    ]
  },
  resolve: {
    modulesDirectories: [__dirname + '/../app/node_modules']
  },
  plugins: []
}

if (mode('dev')) {
  config.devtool = 'source-map'
}

if (mode('prod')) {
  config.plugins.push(
    new (require('webpack-uglify-js-plugin'))({
      cacheFolder: '/tmp',
      debug: false,
      minimize: true,
      sourceMap: false,
      compress: {
        warnings: true
      },
      output: {
        // banner: 'Author: Taras Labiak <kissarat@gmail.com>',
        comments: false
      }
    })
  )
}

if (mode('upload')) {
  const source = __dirname + '/../public/gay'
  const run = []
  run.push(`scp ${source}.js web@vk-mm.com:www/sam/public/`)
  console.log(run)
  config.plugins.push(
    new (require('webpack-shell-plugin'))({
      onBuildExit: [run.join(' && ')]
    })
  )
}

module.exports = config
