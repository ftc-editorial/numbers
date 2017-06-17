const debug = require('debug')('nums:datasets');
const got = require('got');
const units = require('../translation/units.json');
const errors = require('../utils/errors.js');
const url = process.env.LASTEST_DATA_URL ||  'https://ig.ft.com/autograph/data/latest.json';

/**
 * Fetch statictics from autograph and convert data to a map.
 */
class Datasets {
  constructor() {
    this._rawData = null;
  }

  async fetch() {
    // if (this.cache) {
    //   debug('Find cached datasets.')
    //   return this.cache;
    // }
    debug(`Fetching ${url}`);
    this._rawData = await got(url, {
        json: true
      })
      .then(response => {
        return response.body;
      });
  }

  convert() {
    if (!this._rawData) {
      throw errors('Autograph Datasets');
    }
    const o = {};
    for (let data of this._rawData) {
      const key = data.id;
      if (!key) {
        continue;
      }
      o[key] = {
        id: data.id,
        date: new Date(data.date),
        value: data.value,
        unit: translate(data.unit),
      }
    }
    return o;
  }

  async getData() {
    await this.fetch();
    return this.convert();
  }
}

function translate(source) {
  if (units.hasOwnProperty(source)) {
    return units[source];
  }
  return source;
}

module.exports = new Datasets();