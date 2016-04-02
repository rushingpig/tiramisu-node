'use strict';

const webpack           = require('webpack');
const baseConfig        = require('./webpack.config.js');
const path              = require('path');
const assign            = require('object-assign');

const config = {
  output: {
    path: path.join(__dirname, 'build'),
    publicPath: 'http://localhost:3000/',
    filename: '[name].bundle.js'
  },
  devtool: 'source-map',
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loaders: ['react-hot', 'babel'], // 位置不能颠倒
      exclude: /node_modules/,
      include: path.join(__dirname, 'src/js/redux')
    }]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"development"'
    }),
    new webpack.optimize.CommonsChunkPlugin('commons', '[name].bundle.js'),
    new webpack.HotModuleReplacementPlugin(),
  ].concat(baseConfig.plugins),
};

module.exports = assign({}, baseConfig, config);
