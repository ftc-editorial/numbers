const path = require('path');
const loadJsonFile = require('load-json-file');

const publicDir = path.resolve(__dirname, '../public');
const dataDir = path.resolve(__dirname, '../public/data');

function filenameFor(economy) {
  return `${dataDir}/dashboard-${economy}.json`
}

async function getDataFor(economy) {
  return loadJsonFile(filenameFor(economy));
}

module.exports = {
  publicDir,
  dataDir,
  filenameFor,
  getDataFor
}