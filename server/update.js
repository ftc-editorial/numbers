const debug = require('debug')('apn:home');
const Router = require('koa-router');
const router = new Router();
const Model = require('../model');

router.get('/', async function (ctx, next) {
  await Model.init();
  ctx.body = 'Refresh data successful.';
  ctx.redirect('/');
  return;
});

module.exports = router;