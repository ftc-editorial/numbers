const path = require('path');
const writeJsonFile = require('write-json-file');
const latest = require('../server/latest.js');
const dest = path.resolve(__dirname, '../public/latest.json');

latest.getData()
  .then(data => {
    return writeJsonFile(dest, data);
  })
  .catch(err => {
    console.log(err);
  });