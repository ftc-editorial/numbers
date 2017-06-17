const debug = require('debug')('nums:test-options');
const path = require('path');
const writeJsonFile = require('write-json-file');
const datasets = require('../model/datasets.js');
const model = require('../model');
const buildOptions = require('../model/build-options.js')
const groupCards = require('../model/group-cards.js');
const joinCards = require('../model/join-cards.js');
const dest = path.resolve(__dirname, '../.tmp');

async function sheetToDashboard() {
  const numbers = await datasets.getData();
  debug(`Length of autograph datasets: ${datasets._rawData.length}`);

  debug(`Saving raw autograph data.`);
  await writeJsonFile(`${dest}/autograph-raw.json`, datasets._rawData);
  debug(`Saving reduced autograph data.`);
  await writeJsonFile(`${dest}/autograph.json`, numbers); 

  const rawSheets = await model.fetchAllSheets();
  for (let sheet of rawSheets) {
    const spreadsheet = sheet.data;

    debug(`Saving raw spreasheet data for ${sheet.name}`);
    await writeJsonFile(`${dest}/sheet-${sheet.name}.json`, sheet.data);

    const options = buildOptions(sheet.data.options);
    await writeJsonFile(`${dest}/options-${sheet.name}.json`, options);

    const cardsByGroup = groupCards(spreadsheet.data, numbers);
    await writeJsonFile(`${dest}/cards-${sheet.name}.json`, cardsByGroup);

    const groups = joinCards(spreadsheet.groups, cardsByGroup);
    await writeJsonFile(`${dest}/groups-${sheet.name}.json`, groups);
  }
  debug(`Done.`);
}

sheetToDashboard()
  .catch(err => {
    console.log(err);
  });

exports