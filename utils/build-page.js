const debug = require('debug')('nums:build-page');
const pify = require('pify');
const path = require('path');
const fs = require('fs-jetpack');
const loadJsonFile = require('load-json-file');
const writeJsonFile = require('write-json-file');
const inline = pify(require('inline-source'));
const minify = require('html-minifier').minify;
const store = require('./store');

const page = require('./page.js');
page.loaderOptions = {noCache: true};

const commonData = require('./common-data.js');

async function buildPage({template='dashboard.html', economy='china', outDir=store.publicDir}={}) {
  const destFile = `${outDir}/${economy}.html`;

  debug(`Using data file: ${store.filenameFor(economy)}`);
  const data = await store.getDataFor(economy);
  const context = Object.assign(commonData, data);

  let html = await page.render(template, context);
  if (process.env.NODE_ENV === 'production') {
    debug(`Inline js and css`);
    html = await inline(html, {
      compress: false,
      rootpath: path.resolve(__dirname, `../public`)
    });

    debug(`Minify html`);
    html = minify(html, {
      collapseBooleanAttributes: true,
      collapseInlineTagWhitespace: true,
      collapseWhitespace: true,
      conservativeCollapse: true,
      removeComments: true,
      minifyCSS: true,
      minifyJS: true
    });
  }
  debug(`HTML file: ${destFile}`);
  await fs.writeAsync(destFile, html);
}

if (require.main === module) {
  buildPage()
    .catch(err => {
      console.log(err);
    });
}

module.exports = buildPage;