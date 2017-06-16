const debug = require('debug')('apn:home');
const Router = require('koa-router');
const router = new Router();
const render = require('../utils/render.js');

router.get('/', async function index(ctx, next) {
  Object.assign(ctx.state, {
    pageGroup: 'index'
  });
  ctx.body = await render('home.html', ctx.state);
});

module.exports = router;