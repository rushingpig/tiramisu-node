var webpack = require('webpack');
var baseConfig = require('./webpack.base.config');
var assign = require('object-assign');

module.exports = assign({
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"development"'
    }),
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: ['react-hot', 'babel'],
        exclude: /node_modules/,
        include: __dirname
      }
    ]
  }
}, baseConfig);   //baseConfig放后面
