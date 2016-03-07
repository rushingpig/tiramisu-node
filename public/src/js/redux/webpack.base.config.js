var path = require('path');

module.exports = {
  entry: [
    path.join(__dirname, './index.js')
  ],
  devtool: 'cheap-module-source-map',
  output: {
    path: path.join(__dirname, '../'),
    filename: 'app.js',
    publicPath: "http://localhost:3000/"
  },
  resolve: {
    alias: {
      'utils': path.join(__dirname, './utils'),
      'mixins': path.join(__dirname, './mixins'),
      'reducers': path.join(__dirname, './reducers'),
      'common': path.join(__dirname, './components/common'),
      'actions': path.join(__dirname, './actions'),
      'config': path.join(__dirname, './config'),
      'history_instance$': path.join(__dirname, './history.js'),
      'stores': path.join(__dirname, './stores')
    }
  }
}