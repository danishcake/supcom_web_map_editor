const merge = require('webpack-merge');
const common = require('./webpack.common.config');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = merge(common, {
  mode: "production",
  // Optimisation disabled as we're going to apply it in the bin webpacking
  // optimization: {
  //   minimizer: [
  //     new UglifyJsPlugin()
  //   ]
  // }
});