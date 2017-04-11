const path = require('path');
const loadJsonFile = require('load-json-file');
const writeJsonFile = require('write-json-file');
const createDashboard = require('../server/create-dashboard.js');
const urls = require('../server/urls.js');
const latest = require('../public/latest.json');

Promise.all(urls.docNames.map(name => {
  const source = path.resolve(__dirname, `../public/bertha-${name}.json`);
  const dest = path.resolve(__dirname, `../public/dashboard-${name}.json`)
  return loadJsonFile(source)
    .then(data => {
      console.log(`Saving dashboard data to ${dest}`);
      const dashboard = createDashboard(data, latest, name);
      return writeJsonFile(dest, dashboard);
    });
}))
.catch(err => {
  console.log(err);
});