const debug = require('debug')('nums:server');
const path = require('path');
const Koa = require('koa')
const Router = require('koa-router');
const serve = require('koa-static');
const logger = require('koa-logger');
const footer = require('@ftchinese/ftc-footer')({theme: 'theme-light'});
const loadJsonFile = require('load-json-file');
const render = require('./util/render.js');
const name = 'Numbers';
const port = process.env.PORT || 3000;
const env = {
  isProduction: process.env.NODE_ENV === 'production'
};

debug('booting %s', name);

const app = new Koa();
const router = new Router();

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
  const context = await loadJsonFile(path.resolve(process.cwd(), 'data/dashboard-china.json'));
  ctx.body = await render('numbers.html', Object.assign(context, {
    footer
  }));
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(port, () => {
  debug(`App listening on port ${port}`);
});