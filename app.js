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

app.proxy = true;

// App error logging
app.on('error', function (err, ctx) {
  debug(err);
});

app.use(logger());

if (process.env.NODE_ENV !== 'production') {
  app.use(serve(path.resolve(process.cwd(), '.tmp')));
}

// Prepare data used by the whole app.
app.use(async function (ctx, next) {
  debug(`Attaching data to ctx.state`);
  ctx.state = {
    meta: {
      title: '经济数据一图览'
    },
    env,
    footer
  }
  await next();
});

// Send Custom Error Page
let messages = {
  404: 'Not Found',
  500: 'Server Error'
};

app.use(async function (ctx, next) {
  try {
// Catch all errors from downstream    
    await next();
  } catch (e) {
    const status = e.status || 500;
    const data = app.env === 'production' ? {
      message: messages[status],
      error:  {}
    } : {
      message: e.message,
      error: e
    };
    ctx.response.status = status;
    ctx.body = await render('error.html', data);
  }
});

// Router
router.get('/', async function index(ctx, next) {
  const data = Object.assign({}, ctx.state, {
    pageGroup: 'index'
  });
  ctx.body = await render('home.html', data);
});

router.get('/:economy', async function (ctx, next) {
  const economy = ctx.params.economy;
  const dashboardData = await dashboard.getDataFor(economy);
  const data = Object.assign(dashboardData, ctx.state, {
    pageGroup: 'dashboard'
  });
  ctx.body = await render('dashboard.html', data);
});

router.get('/urls/republish', async function (ctx, next) {
  ctx.body = urls.getUrls(true);
});

router.get('/urls/read', async function (ctx, next) {
  ctx.body = urls.getUrls();
});

// Purge all cache.
router.get('/__operations/refresh', async function (ctx, next) {
  dashboard.purgeLocalCache();
  dashboard.purgeBerthaCache();
  await dashboard.getDataForAll();
  ctx.body = 'Refresh data successful.';
});

// Use router
app.use(router.routes());
app.use(router.allowedMethods());

// Create server
const server = app.listen(port);

// Logging server error.
server.on('error', (error) => {
  debug('Server error');
});

// Listening event handler
server.on('listening', () => {
  debug(`App listening on port ${port}`);
// After server boot, ask it fetch data to bertha immediately and cache them.  
  return dashboard.getDataForAll()
    .catch(err => {
      console.log(err);
    });
});