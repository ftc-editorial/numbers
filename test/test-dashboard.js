const path = require('path');
const loadJsonFile = require('load-json-file');
const writeJsonFile = require('write-json-file');
const createDashboard = require('../server/create-dashboard.js');
const source = path.resolve(__dirname, 'example-bertha.json');
const dest = path.resolve(__dirname, 'example-dashboard.json');

loadJsonFile(source)
  .then(json => {
    console.log('Transforming data...');
    return createDashboard(json);
  })
  .then(dashboard => {
    console.log(`Saving to ${dest}`);
    return writeJsonFile(dest, dashboard);
  })
  .catch(err => {
    console.log(err);
  });