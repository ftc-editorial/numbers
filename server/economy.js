const loadJsonFile = require('load-json-file');
const Router = require('koa-router');
const router = new Router();
const page = require('../utils/page.js');
const store = require('../utils/store');

router.get('/:economy', async function (ctx, next) {
  const economy = ctx.params.economy;
  const dashboard = await store.getDataFor(economy);
  Object.assign(ctx.state, dashboard,  {
    pageGroup: 'dashboard'
  });
  ctx.body = await page.render('dashboard.html', ctx.state);
});

module.exports = router;