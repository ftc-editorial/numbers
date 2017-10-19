const debug = require('debug')('apn:home');
const Router = require('koa-router');
const router = new Router();
const model = require('../model');

router.get('/', async function (ctx, next) {
  model.purgeLocalCache();
  model.purgeBerthaCache();
  await model.getAllDashboards();
  ctx.body = 'Refresh data successful.';
});

module.exports = router;