const debug = require('debug')('nums:dashboard');
const got = require('got');
const errors = require('../util/errors.js');
const latest = require('./latest.js');
const createDashboard = require('./create-dashboard.js');
const urls = require('./urls.js');

class Dashboard {
  constructor() {
    this.cache = {};
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

    const url = urls.getUrlFor(name, this.republish);
    
    if (!url) {
      debug(`Economy for ${name} not found`);
      return Promise.reject(errors.notFound('Economy'));
    }
    
    debug(`Fetching data for ${name}`);
    return Promise.all([
      got(url, { json: true})
      .then(response => {
        return response.body;
      }),
      latest.getData()
    ])
    .then(([spreadsheet, latest]) => {
      const dashboard = createDashboard(spreadsheet, latest, name);

      this.cache[name] = dashboard;
      debug(`Data for ${name} cached.`);

      return dashboard;
    })
    .catch(err => {
      throw err;
    });
  }

  getDataForAll() {
    return Promise.all(urls.docNames.map(name => {
      return this.getDataFor(name);
    }));
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