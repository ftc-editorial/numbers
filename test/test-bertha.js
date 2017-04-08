const path = require('path');
const got = require('got');
const writeJsonFile = require('write-json-file');
const urls = require('../server/urls.js');

Promise.all(urls.docNames.map(name => {
  const url = urls.getUrlFor(name, true);
  const dest = path.resolve(__dirname, `bertha-${name}.json`);
  console.log(`Fetching ${url}`);
  return got(url, {json: true})
    .then(response => {
      console.log(`Saving ${dest}`);
      return writeJsonFile(dest, response.body)
    });
}))
.catch(err => {
  console.log(err);
});
