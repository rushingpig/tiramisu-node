'use strict';

const webpack    = require('webpack');
const baseConfig = require('./webpack.config.js');
const path       = require('path');
const assign     = require('object-assign');

//只有正式环境和pr上，采用production方式打包
const ENV = (process.env.NODE_ENV == 'production' || process.env.NODE_ENV == 'pr') ? 'production' : 'development';

var plugins = [
  new webpack.DefinePlugin({
    // 'process.env.NODE_ENV': '"production"'
    'process.env.NODE_ENV': JSON.stringify(ENV)
  }),
  new webpack.optimize.CommonsChunkPlugin('commons', '[name].[hash].bundle.js'),
]
if(ENV == 'production'){
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      minimize: true
    })
  )
}

const config = {
  output: {
    path: path.join(__dirname, 'build'),
    publicPath: '/build/',
    filename: '[name].[hash].bundle.js'
  },
  plugins: plugins.concat(baseConfig.plugins)
}

if(ENV != 'production'){
  config.devtool = 'source-map';
}

module.exports = assign({}, baseConfig, config);