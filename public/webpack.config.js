'use strict';

const path         = require('path');
const webpack      = require('webpack');
const AssetsPlugin = require('assets-webpack-plugin');

const config = {
  entry: {
    commons: [
      'react',
      // 'react-dom',
      // 'react-redux',
      // 'react-addons-linked-state-mixin',
      // 'redux',
      // 'redux-thunk',
      // 'history_instance',
      // 'superagent',
      // 'redux-simple-router'
    ],
    index: ['./src/js/redux/index.js']
  },
  resolve: {
    alias: {
      'utils'            : path.join(__dirname, './src/js/redux/utils'),
      'mixins'           : path.join(__dirname, './src/js/redux/mixins'),
      'reducers'         : path.join(__dirname, './src/js/redux/reducers'),
      'common'           : path.join(__dirname, './src/js/redux/components/common'),
      'actions'          : path.join(__dirname, './src/js/redux/actions'),
      'config'           : path.join(__dirname, './src/js/redux/config'),
      'history_instance' : path.join(__dirname, './src/js/redux/history'),
      'stores'           : path.join(__dirname, './src/js/redux/stores')
    }
  },
  plugins: [
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new AssetsPlugin({
      path: path.join(__dirname, 'build'),
      filename: 'webpack.assets.js',
      // processOutput: assets => 'window.WEBPACK_ASSETS = ' + JSON.stringify(assets)
    })
  ],
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loader: 'babel',
      exclude: /node_modules/,
      include: path.join(__dirname, 'src/js/redux')
    }]
  }
}

module.exports = config;