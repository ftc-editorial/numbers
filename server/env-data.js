const debug = require('debug')('nums:common-data');
const footer = require('@ftchinese/ftc-footer')({theme: 'theme-light'});
const isProduction = process.env.NODE_ENV === 'production';

// Those data are fixed, so make them ready on server startup, not on each request.
const env = {
  urlPrefix: 'http://interactive.ftchinese.com/favicons',
  isProduction,
};

module.exports = async function (ctx, next) {
  debug(`Attaching data to ctx.state`);
  Object.assign(ctx.state, {env, footer});
  await next();
}