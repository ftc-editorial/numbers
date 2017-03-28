const fs = require('fs-jetpack');
const path = require('path');
const loadJsonFile = require('load-json-file');
const writeJsonFile = require('write-json-file');

 async function createDashboard() {
  const spreadsheet = await loadJsonFile(path.resolve(__dirname, '../data/china-en.json'));

  const options = spreadsheet.options.reduce((o, row) => {
    o[row.name] = {text: row.value, html: row.html || row.value};
    return o;
  }, {});

  await writeJsonFile(path.resolve(__dirname, '../data/options.json'), options);

  const cardsByGroup = spreadsheet.data.reduce((o, row) => {
    const id = row.group;
    if (o[id]) {
      o[id].push(row)
    } else {
      o[id] = [row];
    }
    return o;
  }, {});

  await writeJsonFile(path.resolve(__dirname, '../data/cards.json'), cardsByGroup);

  const groups = spreadsheet.groups.map(group => {
    const id = group.id;
    console.log(id);
    const indicators = id && cardsByGroup[id];
    if (id && indicators) {
      group.cards = indicators.map(indicator => {
        indicator.group = group;
        return indicator;
      });
    }
    return group;
  });

  await writeJsonFile(path.resolve(__dirname, '../data/groups.json'), groups);
 }

createDashboard();