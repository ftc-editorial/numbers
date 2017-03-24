const serveStatic = require('serve-static');
const Koa = require('koa')
const app = new Koa();
const render = require('./util/render.js');

const serve = serveStatic('.tmp', {
  index: false
});

app.use(async function(ctx, next) {

});

app.use(async function(ctx) {
  ctx.body = await render('index.html');
});

app.listen(process.env.PORT || 3000);