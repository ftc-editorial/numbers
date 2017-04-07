/** Example data structure in `test` directory.
 * @param {Object} spreadsheet - JSON fetched from bertha, which in turn fetches from a Google Spreadsheet
 * @param {Object[]} spreadsheet.options - Meta data
 * @param {Object[]} spreadsheet.groups - Index
 * @param {Object[]} spreadsheet.data - Data to be transfromed and merged into `groups`
 * @param {object[]} spreadsheet.credits
 * @param {String} name - country name `china | us | uk | japan`
 */
function createDashboard(spreadsheet, name) {
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
    name: name,
    title: options.title,
    introText: options.introText,
    edition: options.edition,
    meta: {
      title: options.title && options.title.text,
      description: options.description && options.description.text,
      canonicalUrl: `http://ig.ftchinese.com/numbers/${name}`,
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

}

module.exports = createDashboard;