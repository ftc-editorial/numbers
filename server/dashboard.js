const debug = require('debug')('nums:dashboard');
const got = require('got');
const errors = require('../util/errors.js');
const latest = require('./latest.js');
const createDashboard = require('./create-dashboard.js');
const urls = require('./urls.js');

class Dashboard {
  constructor() {
    this.cache = {};
    this.sheets = {};
// By default use bertha's cached data.    
    this.republish = false;
  }

// Clear local cache so that we could update data.
  purgeLocalCache () {
    latest.cache = null;
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
  getDataFor(name) {
    const dashboard = this.cache[name];
// Find local cached data, use it.
    if (dashboard) {
      debug(`Use cached data for ${name}`);
      return dashboard;
    }
    
// Fetch `latest` and a `spreadsheet` data in parallel
    return Promise.all([
        this.fetchSheet(name),
        latest.getData()
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

  async getAll() {
// Here we need to fetch latest first, and then fetch spreadsheet in parallel
    const latestData = await latest.getData();

    debug('Fetching all data for all dashboards');
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

if (require.main === module) {
  new Dashboard().getDataFor('china')
    .then(data => {
      console.log(data);
    })
    .catch(err => {
      console.log(err);
    });
}

module.exports = new Dashboard();