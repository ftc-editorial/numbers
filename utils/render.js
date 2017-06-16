const path = require('path');
const nunjucks = require('nunjucks');
const register = require('./filter.js');

const loaderOptions = process.env.NODE_ENV === 'production' ? {} : { noCache: true, watch: true };

var env = new nunjucks.Environment(
  new nunjucks.FileSystemLoader(
    [
      path.resolve(process.cwd(), 'views'),
      path.resolve(process.cwd(), 'node_modules/@ftchinese/ftc-footer'),
    ],
    loaderOptions
  ),
  {autoescape: false}
);

// registe filters
register(env);

function render(template, context) {
  return new Promise(function(resolve, reject) {
    env.render(template, context, function(err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

module.exports = render;