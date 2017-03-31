const fs = require('fs-jetpack');
const path = require('path');
const loadJsonFile = require('load-json-file');
const writeJsonFile = require('write-json-file');

const dest = path.resolve(__dirname, '../data');

async function createDashboard() {
  const spreadsheet = await loadJsonFile(path.resolve(__dirname, '../data/china-en.json'));

  const options = spreadsheet.options.reduce((o, row) => {
    o[row.name] = {text: row.value, html: row.html || row.value};
    return o;
  }, {});

  await writeJsonFile(`${dest}/options.json`, options);

  const cardsByGroup = spreadsheet.data.reduce((o, row) => {
    const id = row.group;
    if (o[id]) {
      o[id].push(row)
    } else {
      o[id] = [row];
    }
    return o;
  }, {});

  await writeJsonFile(`${dest}/cards.json`, cardsByGroup);

  const groups = spreadsheet.groups.map(group => {
    const id = group.id;
    const cards = id && cardsByGroup[id];
    if (id && cardsByGroup.hasOwnProperty(id)) {
      group.cards = cardsByGroup[id];
    } else {
      group.cards = null;
    }
    
    return group;
  }).filter(group => {
    return !!group.cards
  });

  await writeJsonFile(`${dest}/groups.json`, groups);

  let dashboard = {
    title: options.title,
    introText: options.introText,
    edition: options.edition,
    meta: {
      title: options.title && options.title.text,
      description: options.description && options.description.text,
      wx: {
        image: options['wx:image'] && options['wx:image'].text
      },
      og: {
        site_name: options['og:site_name'] && options['og:site_name'].text,
        title: options['og:title'] && options['og:title'].text,
        description: options['og:description'] && options['og:description'].text,
        image: options['og:image'] && options['og:image'].text
      }
    },
    groups,
    credits: spreadsheet.credits,
  }

  await writeJsonFile(`${dest}/dashboard.json`, dashboard);
 }

try {
  createDashboard();
} catch (e) {
  console.log(e);
}
