webpack -w --config ui/webpack.config.js &
sleep 10
webpack -w --config inject/webpack.config.js &
sleep 10
electron app
