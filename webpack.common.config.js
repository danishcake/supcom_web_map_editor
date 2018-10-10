const path = require('path');
const glob = require('glob');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: {
    app : [
      ...glob.sync('./sc_map_edit_bin/src/**/*.js')
    ]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js'
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      fs: path.resolve(__dirname, './sc_map_io_lib/src/lib/thirdparty/dummy-fs.js')
    }
  },
  target: "web",
  plugins: [
    new MiniCssExtractPlugin({})
  ],
  module: {
    rules: [
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader"
      },

      // All files with a '.ts' extension will be handled by 'awesome-typescript-loader'.
      {
        test: /\.ts$/,
        loader: "ts-loader"
      },
      {
        test: /\.css$/,
        use: [{ loader: MiniCssExtractPlugin.loader }, "css-loader"]
      },
      {
        // TBD This regex looks overcomplicated - simplify!
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'fonts/'
          }
        }]
      },
      {
        test: /\.html$/,
        use: [{
          loader: 'html-loader'
        }]
      },
      {
        test: /\.(png|jp(e*)g)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 16000, // Threshold chosen as it's larger than everything in game-resources.js
            name: 'images/[hash]-[name].[ext]'
          }
        }]
      },
      {
        test: require.resolve('jquery'),
        use: [{
          loader: 'expose-loader',
          options: 'jQuery'
        },{
          loader: 'expose-loader',
          options: '$'
        }]
      },
      {
        test: require.resolve('hamsterjs'),
        use: [{
          loader: 'expose-loader',
          options: 'Hamster'
        }]
      }
    ]
  }
};