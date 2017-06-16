const debug = require('debug')('apn:home');
const Router = require('koa-router');
const router = new Router();
const urls = require('../models/urls.js');

router.get('/republish', async function (ctx, next) {
  ctx.body = urls.getUrls(true);
});

router.get('/read', async function (ctx, next) {
  ctx.body = urls.getUrls();
});

module.exports = router;