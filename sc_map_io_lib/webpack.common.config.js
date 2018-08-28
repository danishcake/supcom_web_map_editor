const path = require('path');

module.exports = {
  entry: './sc_map_io_lib/src/lib/sc.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'sc_map_io_lib.bundle.js',
    libraryTarget: "commonjs"
  },
  target: "web",
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      fs: path.resolve(__dirname, 'src/lib/thirdparty/dummy-fs.js')
    }
  },
  module: {
    rules: [
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
      // All files with a '.ts' extension will be handled by 'awesome-typescript-loader'.
      { test: /\.ts$/, loader: "ts-loader" }
    ],
  },
};