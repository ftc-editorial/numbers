const debug = require('debug')('apn:home');
const Router = require('koa-router');
const router = new Router();
const page = require('../utils/page.js');

router.get('/', async function index(ctx, next) {
  Object.assign(ctx.state, {
    title: {
      text: "经济数据一图览"
    },
    pageGroup: 'index'
  });
  ctx.body = await page.render('home.html', ctx.state);
  return await next();
});

module.exports = router;