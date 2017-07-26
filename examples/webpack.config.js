const fs = require('fs')
const path = require('path')
const webpack = require('webpack')

module.exports = {

  devtool: '#source-map',

  entry: fs.readdirSync(__dirname).reduce((entries, dir) => {
    const fullDir = path.join(__dirname, dir)
    const entry = path.join(fullDir, 'app.ts')
    if (fs.statSync(fullDir).isDirectory() && fs.existsSync(entry)) {
      entries[dir] = ['webpack-hot-middleware/client', entry]
    }
    return entries
  }, {}),

  output: {
    path: path.join(__dirname, '__build__'),
    filename: '[name].js',
    chunkFilename: '[id].chunk.js',
    publicPath: '/__build__/'
  },

  module: {
    rules: [
      // { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loader: {
            css: 'css-loader'
          }
        }
      },
      {
        test: /\.ts$/,
        exclude: /node_modules|vue\/src/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/]
        }
      },
    ]
  },

  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      vues: path.resolve(__dirname, '../src/index.ts'),
      vue4vues: "vue/dist/vue.esm.js"
    }
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'shared',
      filename: 'shared.js'
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ]

}