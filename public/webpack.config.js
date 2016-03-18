'use strict';

const path         = require('path');
const webpack      = require('webpack');
const AssetsPlugin = require('assets-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const Dependents = {
  // 'react': 'react/dist/react.min.js',
  'react-dom'                       : 'react-dom/dist/react-dom.min.js',
  'react-router'                    : 'react-router/umd/ReactRouter.min.js',
  'react-redux'                     : 'react-redux/dist/react-redux.min.js',
  'react-addons-linked-state-mixin' : 'react-addons-linked-state-mixin/index.js',
  'redux'                           : 'redux/dist/redux.min.js',
  'redux-thunk'                     : 'redux-thunk/lib/index.js',
  'history_instance'                : 'history/umd/History.min.js',
  'superagent'                      : 'superagent/superagent.js',
  "redux-simple-router"             : 'redux-simple-router/lib/index.js'
};

const config = {
  devtool: 'cheap-module-source-map',
  entry: {
    commons: ['react', ...Object.keys(Dependents)],
    index: [
      './src/js/redux/index.js'
    ]
  },
  resolve: {
    alias: Object.assign(Dependents, {
      'react$'           : 'react/dist/react.min.js',
      'utils'            : path.join(__dirname, './src/js/redux/utils'),
      'mixins'           : path.join(__dirname, './src/js/redux/mixins'),
      'reducers'         : path.join(__dirname, './src/js/redux/reducers'),
      'common'           : path.join(__dirname, './src/js/redux/components/common'),
      'actions'          : path.join(__dirname, './src/js/redux/actions'),
      'config'           : path.join(__dirname, './src/js/redux/config'),
      'history_instance' : path.join(__dirname, './src/js/redux/history'),
      'stores'           : path.join(__dirname, './src/js/redux/stores')
    })
  },
  output: {
    path: path.join(__dirname, 'build'),
    publicPath: '/build/',
    filename: '[name].[hash].bundle.js'
  },
  plugins: [
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.CommonsChunkPlugin('commons', '[name].[hash].bundle.js'),
    new webpack.optimize.OccurenceOrderPlugin(),
    new AssetsPlugin({
      filename: 'build/webpack.assets.js',
      processOutput: assets => 'window.WEBPACK_ASSETS = ' + JSON.stringify(assets)
    }),
    new ExtractTextPlugin("css/style.[hash].min.css", {
      allChunks: true
    })
  ],
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loader: 'babel',
      exclude: /node_modules/,
      include: __dirname
    }, {
      test: /\.s(c|a)ss$/,
      loader: ExtractTextPlugin.extract("style-loader", "css-loader!sass-loader")
    }],
    nodeParse: [
      'react/dist/react.min.js',
      ...Object.keys(Dependents).map(key => Dependents[key])
    ]
  }
}

module.exports = config;