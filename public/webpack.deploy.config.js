'use strict';

const webpack    = require('webpack');
const baseConfig = require('./webpack.config.js');

const config = {
  resolve: Object.assign(
    baseConfig.resolve, {
      alias: Object.assign(baseConfig.resolve.alias, {
        'react$'           : 'react/dist/react.min.js',
        'react-dom'        : 'react-dom/dist/react-dom.min.js',
        'react-router'     : 'react-router/umd/ReactRouter.min.js',
        'react-redux'      : 'react-redux/dist/react-redux.min.js',
        'redux'            : 'redux/dist/redux.min.js',
        'history_instance' : 'history/umd/History.min.js'
      })
    }
  ),
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      minimize: true
    }),
    ...baseConfig.plugins
  ]
}

module.exports = Object.assign(baseConfig, config);