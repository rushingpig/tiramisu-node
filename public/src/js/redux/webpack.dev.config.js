var path = require('path');
var webpack = require('webpack');

console.log(path.join(__dirname, '../'));
module.exports = {
  devtool: 'source-map',
  entry: [
    path.join(__dirname, './index.js')
  ],
  output: {
    path: path.join(__dirname, '../'),
    filename: 'app.js',
    publicPath: "http://localhost:3000/"
  },
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
}
