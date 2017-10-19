const debug = require('debug')('nums:server');
const path = require('path');
const Koa = require('koa');
const app = new Koa();
const Router = require('koa-router');
const router = new Router();
const logger = require('koa-logger');

const model = require('./model');
const envData = require('./server/env-data.js');
const handleErrors = require('./server/handle-errors.js');
const home = require('./server/home.js');
const economy = require('./server/economy.js');
const showUrls = require('./server/show-urls.js');
const refresh = require('./server/refresh.js');
const inlineAndMinify = require('./server/inline-min.js');

debug('booting Numbers');

const port = process.env.PORT || 3000;
app.proxy = true;

// App error logging
app.on('error', function (err, ctx) {
  debug(err);
});

app.use(logger());

if (process.env.NODE_ENV !== 'production') {
  app.use(require('koa-static')(path.resolve(process.cwd(), 'public')));
}

app.use(handleErrors);
app.use(envData);
app.use(inlineAndMinify);

router.use('/', home.routes());
router.use('/economy', economy.routes());
router.use('/urls', showUrls.routes());
router.use('/__refresh', refresh.routes());

app.use(router.routes());

// Create server
const server = app.listen(port);

// Logging server error.
server.on('error', (error) => {
  debug(error);
});

// Listening event handler
server.on('listening', () => {
  debug(`App listening on port ${port}`);
// After server boot, ask it fetch data to bertha immediately and cache them.
// Set republish to true so that bertha retreives latest data from GSS rather than using cache.
  model.republish = true;
  return model.getAllDashboards()
    .catch(err => {
      console.log(err);
    });
});