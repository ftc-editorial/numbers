const debug = require('debug')('nums:latest');
const got = require('got');
const errors = require('../util/errors.js');
const url = process.env.LASTEST_DATA_URL ||  'https://ig.ft.com/autograph/data/latest.json';

class Latest {
  constructor() {
    this.cache = null;
  }

  getData() {
    if (this.cache) {
      return this.cache;
    }
    return got(url, {
        json: true
      })
      .then(response => {
        debug('Got the latest data');
        const data = arrayToMap(response.body);
        this.cache = data;
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
        unit: e.unit,
        id: e.id
      };
    }
    return o;
  }, {});
  return map;
}

module.exports = new Latest();