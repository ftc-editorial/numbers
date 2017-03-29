/*
 * @param {Object} spreadsheet - JSON transfromed from a Google Spreadsheet
 * Each key is the sheet's tab name.
 */
function createDashboard(spreadsheet) {
// Reduce array `spreadsheet.options` to an object,
// using each array element's `name` as key.
  const options = spreadsheet.options.reduce((o, row) => {
    o[row.name] = {text: row.value, html: row.html || row.value};
    return o;
  }, {});

// Reduce array `spreadsheet.data` to an object using each element's `group` as key.
// Recategorize each element under this key.
  const cardsByGroup = spreadsheet.data.reduce((o, row) => {
    const id = row.group;
    if (o[id]) {
      o[id].push(row)
    } else {
      o[id] = [row];
    }
    return o;
  }, {});

// Add each `spreadsheet.groups` element a key `cards`.
// Find `card`'s value in `cardsByGroup` identified by `id`.
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

// Creat the data structure
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
  return dashboard;
}

if (require.main === module) {
  const path = require('path');
  const loadJsonFile = require('load-json-file');
  const writeJsonFile = require('write-json-file');
  const dest = path.resolve(__dirname, '../data');
  loadJsonFile(`${dest}/china.json`)
    .then(json => {
      return createDashboard(json);
    })
    .then(dashboard => {
      return writeJsonFile(`${dest}/dashboard-china.json`, dashboard);
    })
    .catch(err => {
      console.log(err);
    });
}

module.exports = createDashboard;