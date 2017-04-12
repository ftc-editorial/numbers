const debug = require('debug')('nums:latest');
const got = require('got');
const url = process.env.LASTEST_DATA_URL ||  'https://ig.ft.com/autograph/data/latest.json';
const unitMap = require('../../translation/unit.json');

class Datasets {
  constructor() {
    this.cache = null;
  }

  fetch() {
    if (this.cache) {
      debug('Find cached datasets.')
      return this.cache;
    }
    debug(`Fetching ${url}`);
    return got(url, {
        json: true
      })
      .then(response => {
        debug('Fetched the datasets');
        const data = arrayToMap(response.body);
        debug('Cache datasets');
        this.cache = Promise.resolve(data);
        return data;
      })
      .catch(err => {
        throw err;
      });
  }
}

function arrayToMap(data) {
  const map = data.reduce((o, e) => {
    if(e.id) {
      e.date = new Date(e.date);
      o[e.id] = {
        date: new Date(e.date),
        value: e.value,
        unit: translate(e.unit),
        id: e.id
      };
    }
    return o;
  }, {});
  return map;
}

function translate(source) {
  if (unitMap.hasOwnProperty(source)) {
    return unitMap[source];
  }

  return source;
}

module.exports = Datasets;