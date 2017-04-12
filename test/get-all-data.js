const path = require('path');
const writeJsonFile = require('write-json-file');
const dashboard = require('../server/dashboard.js');
const destDir = path.resolve(__dirname, '../public');

dashboard.getAll()
  .then(dataArr => {
    return Promise.all(dataArr.map(data => {
      const dest = `${destDir}/dashboard-${data.name}.json`;
      console.log(`Saving file ${dest}`);
      return writeJsonFile(dest, data);
    }));
  })
  .catch(err => {
    console.log(err);
  });