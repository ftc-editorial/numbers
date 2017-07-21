const pify = require('pify');
const path = require('path');
const fs = require('fs-jetpack');
const loadJsonFile = require('load-json-file');
const writeJsonFile = require('write-json-file');
const inline = pify(require('inline-source'));
const minify = require('html-minifier').minify;

const page = require('./page.js');
page.loaderOptions = {noCache: true};

const commonData = require('./common-data.js');

async function buildPage({template='dashboard.html', input='dashboard-china', output='.tmp'}={}) {
  const jsonFile = path.resolve(__dirname, `../public/${input}.json`);
  const destFile = path.resolve(__dirname, `../${output}/${input}.html`);

  console.log(`Using data file: ${jsonFile}`);
  const data = await loadJsonFile(jsonFile);
  const context = Object.assign(commonData, data);

  let html = await page.render(template, context);
  if (process.env.NODE_ENV === 'production') {
    console.log(`Inline js and css`);
    html = await inline(html, {
      compress: false,
      rootpath: path.resolve(__dirname, `../${output}`)
    });

    console.log(`Minify html`);
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
  console.log(`HTML file: ${destFile}`);
  await fs.writeAsync(destFile, html);
}

if (require.main === module) {
  buildPage()
    .catch(err => {
      console.log(err);
    });
}

module.exports = buildPage;