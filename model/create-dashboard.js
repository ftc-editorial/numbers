const debug = require('debug');
const log = debug('nums:create-dashboard');
log.log = console.log.bind(console);
const buildOptions = require('./build-options.js');
const groupCards = require('./group-cards.js');
const joinCards = require('./join-cards.js');
/** 
 * @param {Object} spreadsheet - JSON fetched from bertha, which in turn fetches from a Google Spreadsheet
 * @param {Object[]} spreadsheet.options - Meta data
 * @param {Object[]} spreadsheet.groups - Index
 * @param {Object[]} spreadsheet.data - Data to be transfromed and merged into `groups`
 * @param {object[]} spreadsheet.credits
 * @param {Object} numbers - data from autograph
 * @param {String} name - country name `china | us | uk | japan`
 */
function createDashboard({spreadsheet, numbers, name}={}) {
  log(`Create dashboard for ${name}`);
  log(`Spreadsheet keys: ${Object.keys(spreadsheet)}`);
// Reduce array `spreadsheet.options` to an object,
// using each array element's `name` as key.
  const options = buildOptions(spreadsheet.options);

  const cardsByGroup = groupCards(spreadsheet.data, numbers);
  log(`Cards names: ${Object.keys(cardsByGroup)}`);

// Add each `spreadsheet.groups` element a key `cards`.
// Find `card`'s value in `cards` identified by `id`.
  const groups = joinCards(spreadsheet.groups, cardsByGroup);

// Creat the data structure
  const dashboard = {
    name: name,
    title: options.title,
    introText: options.introText,
    edition: options.edition || null,
    meta: {
      title: options.title && options.title.text,
      description: options.description && options.description.text,
      canonicalUrl: `http://ig.ftchinese.com/numbers/${name}`,
      wx: (options['wx:image'] && options['wx:image'].text) || null,
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

module.exports = createDashboard;