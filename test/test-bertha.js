const path = require('path');
const got = require('got');
const writeJsonFile = require('write-json-file');
const dest = path.resolve(__dirname, 'example-bertha.json');
const urls = require('../server/urls.js')(true);

console.log(`Fetching example data from bertha: ${urls.china}`);

got(urls.china, {
    json: true
  })
  .then(res => {
    console.log(`Saving example data to ${dest}`);
    return writeJsonFile(dest, res.body);
  })
  .catch(err => {
    console.log(err);
  });