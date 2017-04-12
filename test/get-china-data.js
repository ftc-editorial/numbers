const path = require('path');
const writeJsonFile = require('write-json-file');
const models = require('../server/models');
const destDir = path.resolve(__dirname, '../public');

models.of('china')
  .then(data => {
    const dest = `${destDir}/dashboard-china.json`;
    console.log(`Saving file ${dest}`);
    return writeJsonFile(dest, data);
  })
  .catch(err => {
    console.log(err);
  });