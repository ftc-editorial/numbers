const debug = require('debug')('nums:dashboard');
const got = require('got');
const Datasets = require('./datasets.js');
const createDashboard = require('./dashboard.js');
const urls = require('./urls.js');
const errors = require('../utils/errors.js');

const datasets = new Datasets();

class Economy {
  constructor() {
    this.cache = {};
    this.sheets = {};
// By default use bertha's cached data.    
    this.republish = false;
  }

// Clear local cache so that we could update data.
  purgeLocalCache () {
    debug('Clear datasets cache.')
    datasets.cache = null;
    for (let k in this.cache) {
      if (!this.cache.hasOwnProperty(k)) {
        continue;
      }
      debug(`Clear cache for ${k}`);
      this.cache[k] = null;
    }
  }
// Change request url to bertha.
  purgeBerthaCache() {
    this.republish = true;
  }

// helper method
  fetchSheet(name) {
    const url = urls.getUrlFor(name, this.republish);
    
    if (!url) {
      debug(`Economy for ${name} not found`);
      return Promise.reject(errors.notFound('Economy'));
    }

    if (this.sheets[name]) {
      return this.sheets[name];
    }

    debug(`Fetching ${url}`);

    const sheetData = got(url, {json: true})
      .then(res => {
        return res.body;
      });
    // cache this fetch action  
    this.sheets[name] = sheetData;
    return sheetData;
  }
/*
 * @param {String} name - one of the keys in `docs` of urls.js
 * @param {Promise}
 */
  of(name) {
    const dashboard = this.cache[name];
// Find local cached data, use it.
    if (dashboard) {
      debug(`Use cached data for ${name}`);
      return dashboard;
    }
    
// Fetch `datasets` and a `spreadsheet` data in parallel
    return Promise.all([
        this.fetchSheet(name),
        datasets.fetch()
      ])
      .then(([sheetData, latestData]) => {

        const dashboard = createDashboard(sheetData, latestData, name);
// cache data
        debug(`Caching data for ${name}`);
        this.cache[name] = Promise.resolve(dashboard);

        return dashboard;
      })
      .catch(err => {
        throw err;
      });
  }

  async ofAll() {
// Here we need to fetch latest first, and then fetch spreadsheet in parallel
    const latestData = await datasets.fetch();

    debug('Fetching data for all dashboards');
    const dashboards = urls.docNames.map(name => {
      return this.fetchSheet(name)
        .then(sheetData => {
          const dashboard = createDashboard(sheetData, latestData, name);
          
          debug(`Caching data for ${name}`);
          this.cache[name] = Promise.resolve(dashboard);
          return dashboard;
        });
    });
    return Promise.all(dashboards);
  }
}

module.exports = Economy;