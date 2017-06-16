const debug = require('debug')('apn:home');
const Router = require('koa-router');
const router = new Router();
const render = require('../utils/render.js');

router.get('/', async function index(ctx, next) {
  Object.assign(ctx.state, {
    title: {
      text: "经济数据一图览"
    },
    pageGroup: 'index'
  });
  ctx.body = await render('home.html', ctx.state);
  return await next();
});

module.exports = router;