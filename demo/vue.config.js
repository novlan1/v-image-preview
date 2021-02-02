const path = require('path');

function resolve (dir) {
  //此处使用path.resolve 或path.join 可自行调整
  return path.join(__dirname, dir)
}


module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '././' : '/',
  outputDir:'dist',
  chainWebpack: (config) => {
    config.resolve.alias
      .set('img', resolve('public/img'))
  }
}
