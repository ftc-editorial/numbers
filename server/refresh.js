const debug = require('debug')('apn:home');
const Router = require('koa-router');
const router = new Router();
const models = require('../models');

router.get('/', async function (ctx, next) {
  models.purgeLocalCache();
  models.purgeBerthaCache();
  await models.ofAll();
  ctx.body = 'Refresh data successful.';
});

module.exports = router;