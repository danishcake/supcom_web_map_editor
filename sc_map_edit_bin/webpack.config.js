const path = require('path');
const glob = require('glob');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: { 
    app : [
      ...glob.sync('./sc_map_edit_bin/src/**/*.js')
    ]
    /*
    vendor: [
      'angular',
      'angular-sanitize',
      'angular-dialog-service/dist/dialogs.min.js', // TODO: Add CSS bundler
      'angular-ui-bootstrap',
      'file-saver',
      'hamsterjs',
      'angular-mousewheel',
      'bytebuffer',
      'gl-matrix',
      'async',
      'underscore'
    ],*/
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js'
  },
  devtool: "source-map",
  target: "web",
  plugins: [
    new MiniCssExtractPlugin({})
  ],
  module: {
    rules: [
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
        test: /\.(png|jp(e*)g|svg)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 8000, // Convert images < 8kb to base64 strings
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