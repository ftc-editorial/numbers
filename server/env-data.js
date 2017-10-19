const debug = require('debug')('debug:env-data');
const commonData = require('../utils/common-data.js');

module.exports = async function (ctx, next) {
  debug(`Attaching data to ctx.state`);
  Object.assign(ctx.state, commonData);
  await next();
}