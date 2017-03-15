const path = require('path');
const nunjucks = require('nunjucks');

var env = new nunjucks.Environment(
  new nunjucks.FileSystemLoader(
    [
      path.resolve(process.cwd(), 'views'),
      path.resolve(process.cwd(), 'bower_components/ftc-footer'),
      path.resolve(process.cwd(), 'bower_components/ftc-icons')
    ],
    {noCache: true}
  ),
  {autoescape: false}
);

function render(template, context, name) {
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