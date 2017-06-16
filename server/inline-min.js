const pify = require('pify');
const path = require('path');
const inline = pify(require('inline-source'));
const minify = require('html-minifier').minify;

module.exports = async function (ctx, next) {
  await next();
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  if (!ctx.response.is('html')) {
    return;
  }

  let body = ctx.body;
  if (!body || body.pipe) {
    return;
  }

  if (Buffer.isBuffer(body)) body = body.toString();
  body = await inline(body, {
    compress: false,
    rootpath: path.resolve(process.cwd(), './public')
  });

  ctx.body = minify(body, {
    collapseBooleanAttributes: true,
    collapseInlineTagWhitespace: true,
    collapseWhitespace: true,
    conservativeCollapse: true,
    removeComments: true,
    minifyCSS: true,
    minifyJS: true
  });
  return;
}