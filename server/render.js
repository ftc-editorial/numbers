const path = require('path');
const nunjucks = require('nunjucks');
const moment = require('moment');

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

env.addFilter('todate', function(date) {
  return moment(date).format('YYYY年M月D日');
});

env.addFilter('replaceDate', function(str, date) {
  const mnt = moment(date);
  // Do not use moment().format(str) here as str is not predicatable and any character appeared may be replaced.
  return str.replace('YYYY', mnt.year()).replace('QQ', mnt.quarter());
});

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