var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: [
    path.join(__dirname, './app.js')
  ],
  output: {
    path: path.join(__dirname, '../'),
    filename: 'app.js'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    })
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel'],
        exclude: /node_modules/,
        include: __dirname
      }
    ]
  }
}
