const path = require('path');
const Koa = require('koa')
const app = new Koa();
const serve = require('koa-static');
const footer = require('@ftchinese/ftc-footer')({theme: 'theme-light'});
const render = require('./util/render.js');

app.use(serve(path.resolve(process.cwd(), 'public')));
app.use(serve(path.resolve(process.cwd(), 'bower_components')));

app.use(async function(ctx) {
  ctx.body = await render('index.html', {
    pageTitle: '经济数据一图览',
    footer
  });
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`App listening on port ${process.eventNames.PORT || 3000}`);
});