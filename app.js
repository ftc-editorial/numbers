const path = require('path');
const Koa = require('koa')
const app = new Koa();
const serve = require('koa-static');
const render = require('./util/render.js');

app.use(serve(path.resolve(process.cwd(), 'public')));

app.use(async function(ctx) {
  ctx.body = await render('index.html');
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`App listening on prot ${process.eventNames.PORT || 3000}`);
});