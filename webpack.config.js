const HTMLWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const exec = require('child_process').exec;
const webpack = require('webpack');

module.exports = {
  entry: [`${__dirname}/src/index.js`, 'webpack-hot-middleware/client'],
  output: {
    filename: '[name].js',
    path: `${__dirname}/dist`,
    publicPath: '/custom/l3vpnui'
  },
  mode: 'development',
  optimization: {
    usedExports: true,
    splitChunks: {
      chunks: 'all'
    },
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: `${__dirname}/src/index.html`,
      filename: 'index.html',
      inject: 'body'
    }),
    new MiniCssExtractPlugin(),
    {
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
          exec('echo "request packages package l3vpnui redeploy" | ' +
               'ncs_cli -u admin', (err, stdout, stderr) => {
            if (stdout) process.stdout.write(stdout);
            if (stderr) process.stderr.write(stderr);
          });
        });
      }
    },
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['react', 'env'],
            plugins: [
              'react-hot-loader/babel',
              'transform-class-properties',
              'transform-decorators-legacy',
              'transform-object-rest-spread',
              ['transform-runtime', {
                'polyfill': false,
                'regenerator': true
              }]
            ]
          }
        }
      }, {
        test: /\.css$/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          'css-loader'
        ]
      }, {
        test: /\.(svg|ttf)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: '.'
          }
        }
      }
    ]
  },
};
