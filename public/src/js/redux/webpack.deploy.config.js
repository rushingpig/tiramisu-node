var webpack = require('webpack');
var baseConfig = require('./webpack.base.config');
var assign = require('object-assign');

module.exports = assign({
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
}, baseConfig);   //baseConfig 一定放后面
