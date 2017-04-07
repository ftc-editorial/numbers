const debug = require('debug')('nums:server');
const path = require('path');
const Koa = require('koa')
const Router = require('koa-router');
const serve = require('koa-static');
const logger = require('koa-logger');
const footer = require('@ftchinese/ftc-footer')({theme: 'theme-light'});
const loadJsonFile = require('load-json-file');

const dashboard = require('./server/dashboard.js');
const render = require('./util/render.js');
const urls = require('./server/urls.js');

const appName = 'Numbers';
const port = process.env.PORT || 3000;
const env = {
  isProduction: process.env.NODE_ENV === 'production'
};

debug('booting %s', appName);

const app = new Koa();
const router = new Router();

app.use(logger());

if (process.env.NODE_ENV !== 'production') {
  app.use(serve(path.resolve(process.cwd(), '.tmp')));
}

router.get('/', async function index(ctx, next) {
  ctx.body = await render('home.html', {
    pageTitle: '经济数据一图览',
    pageGroup: 'index',
    footer
  });
});

router.get('/:economy', async function (ctx, next) {
  await next();
  const economy = ctx.params.economy;
  try {
    const context = await dashboard.getDataFor(economy);
    ctx.body = await render('dashboard.html', Object.assign(context, {
      footer
    }));
  } catch(e) {
    console.log(e);
  }
});

router.get('/urls/republish', async function (ctx, next) {
  ctx = urls.all(true);
});

router.get('/urls/read', async function (ctx, next) {
  ctx.urls.all();
});

router.get('/__operations/refresh', async function (ctx, next) {
  dashboard.purgeLocalCache();
  dashboard.purgeBerthaCache();
  await dashboard.getDataForAll();
  ctx.body = 'Refresh data successful.';
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(port, () => {
  debug(`App listening on port ${port}`);
  return dashboard.getDataForAll()
    .catch(err => {
      console.log(err);
    });
});