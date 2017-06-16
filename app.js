const debug = require('debug')('nums:server');
const path = require('path');
const Koa = require('koa');
const app = new Koa();
const Router = require('koa-router');
const router = new Router();
const serve = require('koa-static');
const logger = require('koa-logger');

const models = require('./models');
const envData = require('./server/env-data.js');
const handleErrors = require('./server/handle-errors.js');
const home = require('./server/home.js');
const economy = require('./server/economy.js');
const showUrls = require('./server/show-urls.js');
const refresh = require('./server/refresh.js');

debug('booting Numbers');

const port = process.env.PORT || 3000;
app.proxy = true;

// App error logging
app.on('error', function (err, ctx) {
  debug(err);
});

app.use(logger());

if (process.env.NODE_ENV !== 'production') {
  app.use(serve(path.resolve(process.cwd(), '.tmp')));
}

app.use(handleErrors);
app.use(envData);

router.use('/', home.routes());
router.use('/economy', economy.routes());
router.use('/urls', showUrls.routes());
router.use('/__refresh', refresh.routes());

app.use(router.routes());

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
  return models.ofAll()
    .catch(err => {
      console.log(err);
    });
});