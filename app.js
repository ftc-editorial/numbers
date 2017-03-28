const debug = require('debug')('nums:server');
const path = require('path');
const Koa = require('koa')
const Router = require('koa-router');
const serve = require('koa-static');
const logger = require('koa-logger');
const footer = require('@ftchinese/ftc-footer')({theme: 'theme-light'});
const render = require('./util/render.js');
const name = 'Numbers';
const port = process.env.PORT || 3000;

debug('booting %s', name);

const app = new Koa();
const router = new Router();

const countries = {
  china: '',
  us: '',
  uk: '',
  japan: ''
};

app.use(logger());

app.use(serve(path.resolve(process.cwd(), 'public')));
app.use(serve(path.resolve(process.cwd(), 'bower_components')));

router.get('/', async function index(ctx, next) {
  await next();

  ctx.body = await render('index.html', {
    pageTitle: '经济数据一图览',
    pageGroup: 'index',
    footer
  });
});

router.get('/:country', async function china(ctx, next) {
  await next();
  console.log(ctx.params);
  ctx.body = await render('numbers.html', {
    footer
  });
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(port, () => {
  debug(`App listening on port ${port}`);
});