const path = require('path');

module.exports = {
  entry: './sc_map_io_lib/src/lib/sc.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'sc_map_io_lib.bundle.js',
    libraryTarget: "commonjs"
  },
  resolve: {
    alias: {
      fs: path.resolve(__dirname, 'src/lib/thirdparty/dummy-fs.js')
    }
  },
  target: "web"
};