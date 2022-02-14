const { merge } = require('webpack-merge');
const CopyPlugin = require('copy-webpack-plugin');
const common = require('./webpack.common.js');
const lambdaName = 'GeolocationFunction'; // must correspond to lambda name in template.yml

module.exports = merge(common, {
  mode: 'development',
  devtool: 'source-map',
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: './.env', to: `.aws-sam/build/${lambdaName}/` },
      ],
    }),
  ],
});
