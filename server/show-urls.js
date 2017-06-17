const debug = require('debug')('apn:home');
const Router = require('koa-router');
const router = new Router();
const bertha = require('../model/bertha.js');

router.get('/republish', async function (ctx, next) {
  ctx.body = bertha.getUrls(true);
});

router.get('/read', async function (ctx, next) {
  ctx.body = bertha.getUrls();
});

module.exports = router;