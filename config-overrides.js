// const { useBabelRc, override } = require('customize-cra')
const path = require('path')
// const SOURCE_DIR = path.resolve(__dirname, 'src/')
const MomentLocalesPlugin = require('moment-locales-webpack-plugin')
const WebpackGoogleCloudStoragePlugin = require('webpack-google-cloud-storage-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const expiredTime = 0 //60 * 60 * 24
require('dotenv').config()

const destinationName = () => {
  if (process.env.REACT_APP_STYLE_DEV) {
    return 'dev/chat-widget-tickets.css'
  } else if (process.env.REACT_APP_STYLE_PROD) {
    return 'prod/chat-widget-tickets.css'
  } else if(process.env.REACT_APP_STYLE_STAGE) {
    return 'stage/chat-widget-tickets.css'
  }
  else {
    // return process.env.REACT_APP_STYLE(
    //   process.env?.REACT_APP_DESTINATION_NAME
    //     ? process.env.REACT_APP_DESTINATION_NAME
    //     : 'dev/vnt-chat-widget-tickets.js',
    // )
    if(process.env?.REACT_APP_DESTINATION_NAME){
      return process.env.REACT_APP_DESTINATION_NAME
    }
    else{
      return 'dev/vnt-chat-widget-tickets.js'
    }
  }
}

module.exports = {
  webpack: function (config, env) {
    config = {
      ...config,
      optimization: {
        minimize: true,
      },
      output: {
        ...config.output,
        filename: 'chat-widget-tickets.app.js',
      },
      devtool: 'eval',
      optimization: {
        minimizer: [
          new OptimizeCSSAssetsPlugin({
            filename: `${__dirname}/src/assets/Chat.scss`,
          }),
        ],
      },
    }

    config.plugins.push(
      new MiniCssExtractPlugin({
        filename: 'chat-widget-tickets.css',
      }),
    )

    config.plugins.push(
      new MomentLocalesPlugin({
        localesToKeep: ['vi'],
      }),
    )

    config.plugins.push(
      new WebpackGoogleCloudStoragePlugin({
        include: [
          process?.env?.REACT_APP_STYLE_DEV ||
          process?.env?.REACT_APP_STYLE_PROD || 
          process?.env?.REACT_APP_STYLE_STAGE
            ? 'chat-widget-tickets.css'
            : 'chat-widget-tickets.app.js',
        ],
        storageOptions: {
          projectId: 'sonic-trail-91902',
          keyFilename: path.join(__dirname, './', 'keyfile.json'),
        },
        uploadOptions: {
          bucketName: 'mkt-sdk',
          destinationNameFn: () => destinationName(),
          metadataFn: (file) => ({
            // cache it a little longer!
            cacheControl: 'public, max-age=' + expiredTime,
            expires: new Date(new Date().getTime() + expiredTime * 1000),
          }),
          gzip: true,
          concurrency: 5,
        },
      }),
    )

    return config
  },
}
