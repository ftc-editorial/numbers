const debug = require('debug')('apn:home');
const Router = require('koa-router');
const router = new Router();
const model = require('../model');
const render = require('../utils/render.js');

router.get('/:economy', async function (ctx, next) {
  const economy = ctx.params.economy;
  const dashboard = await model.getDashboard(economy);
   Object.assign(ctx.state, dashboard,  {
    pageGroup: 'dashboard'
  });
  ctx.body = await render('dashboard.html', ctx.state);
});

module.exports = router;