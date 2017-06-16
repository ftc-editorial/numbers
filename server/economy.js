const debug = require('debug')('apn:home');
const Router = require('koa-router');
const router = new Router();
const models = require('../models');
const render = require('../utils/render.js');

router.get('/:economy', async function (ctx, next) {
  const economy = ctx.params.economy;
  const dashboardData = await models.of(economy);
   Object.assign(ctx.state, dashboardData,  {
    pageGroup: 'dashboard'
  });
  ctx.body = await render('dashboard.html', ctx.state);
});

module.exports = router;