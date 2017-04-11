const got = require('got');
const path = require('path');
const writeJsonFile = require('write-json-file');
const url = process.env.LASTEST_DATA_URL ||  'https://ig.ft.com/autograph/data/latest.json';
const dest = path.resolve(__dirname, '../public/latest-raw.json');

got(url, { json: true })
  .then(res => {
    return writeJsonFile(dest, res.body);
  })
  .catch(err => {
    console.log(err);
  });