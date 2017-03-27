const path = require('path');
const Koa = require('koa')
const app = new Koa();
const serve = require('koa-static');
const mount = require('koa-mount');
const logger = require('koa-logger');
const footer = require('@ftchinese/ftc-footer')({theme: 'theme-light'});
const render = require('./util/render.js');

app.use(logger());

app.use(serve(path.resolve(process.cwd(), 'public')));
app.use(serve(path.resolve(process.cwd(), 'bower_components')));

async function index(ctx, next) {
  await next();

  // ctx.body = await render('index.html', {
  //   pageTitle: '经济数据一图览',
  //   pageGroup: 'index',
  //   footer
  // });
  ctx.body = 'index.html'
}

async function china(ctx, next) {
  await next();
  console.log('china section');
  // ctx.body = await render('numbers.html');
  ctx.body = 'china';
}

app.use(mount('/', index));
app.use(mount('/china', china));

app.listen(process.env.PORT || 3000, () => {
  console.log(`App listening on port ${process.eventNames.PORT || 3000}`);
});