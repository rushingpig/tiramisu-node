'use strict';

const webpack           = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const baseConfig        = require('./webpack.config.js');

const config = {
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"development"'
    }),
    new webpack.HotModuleReplacementPlugin(),
    ...baseConfig.plugins
  ],
  module: Object.assign(baseConfig.module, {
    loaders: baseConfig.module.loaders.map(
      (opt, i) => i === 0 ? {
        test: /\.jsx?$/,
        loaders: ['react-hot', 'babel'], // 位置不能颠倒
        exclude: /node_modules/,
        include: __dirname
      } : opt
    )
  }),
  devServer: {
    proxy: {
      '*': "http://localhost:3001"
    }
  }};

module.exports = Object.assign(baseConfig, config);