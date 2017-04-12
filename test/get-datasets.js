const path = require('path');
const writeJsonFile = require('write-json-file');
const Datasets = require('../server/models/datasets.js');
const url = process.env.LASTEST_DATA_URL ||  'https://ig.ft.com/autograph/data/latest.json';
const destDir = path.resolve(__dirname, '../public');

const datasets = new Datasets();

got(url, { json: true })
  .then(res => {
    return writeJsonFile(`${destDir}/datasets-raw.json`, res.body);
  })
  .catch(err => {
    console.log(err);
  });

datasets.fetch()
  .then(data => {
    return writeJsonFile(`${destDir}/datasets.json`, data);
  })
  .catch(err => {
    console.log(err);
  });