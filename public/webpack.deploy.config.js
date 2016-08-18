'use strict';

const webpack    = require('webpack');
const baseConfig = require('./webpack.config.js');
const path       = require('path');
const assign     = require('object-assign');

const ENV = process.env.NODE_ENV;

const config = {
  output: {
    path: path.join(__dirname, 'build'),
    publicPath: '/build/',
    filename: '[name].[hash].bundle.js'
  },
  plugins: [
    new webpack.DefinePlugin({
      // 'process.env.NODE_ENV': '"production"'
      'process.env.NODE_ENV': JSON.stringify(ENV == 'production' || ENV == 'pr' ? 'production' : 'development')
    }),
    new webpack.optimize.CommonsChunkPlugin('commons', '[name].[hash].bundle.js'),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      minimize: true
    }),
  ].concat(baseConfig.plugins)
}

module.exports = assign({}, baseConfig, config);
