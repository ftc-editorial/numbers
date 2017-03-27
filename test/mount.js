const Koa = require('koa')
const app = new Koa();
const mount = require('koa-mount');
const loadJsonFile = require('load-json-file');
const render = require('../util/render.js');

async function index(ctx, next) {
  await next();
  
  ctx.body = await render('index.html');
}

async function hello(ctx, next) {
  await next();
  const context = await loadJsonFile('data/numbers-china.json');
  ctx.body = await render('numbers.html', context);
}

async function world(ctx, next) {
  await next();
  ctx.body = 'world'
}

app.use(mount('/', index));
app.use(mount('/hello', hello));
app.use(mount('/world', world));

app.listen(process.env.PORT || 3000, () => {
  console.log(`App listening on port ${process.eventNames.PORT || 3000}`);
});