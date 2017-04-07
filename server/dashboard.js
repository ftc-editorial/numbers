const got = require('got');
const errors = require('../util/errors.js');
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
    for (let k in this.cache) {
      if (!this.cache.hasOwnProperty(k)) {
        continue;
      }
      console.log(`Clear cache for ${k}`);
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
      console.log(`Use cached data for ${name}`);
      return dashboard;
    }

    const url = urls.one(name, this.republish);
    
    if (!url) {
      return Promise.reject(errors.notFound('Economy'));
    }
    
    console.log(`Fetching data for ${name}`);
    return got(url, {
        json: true
      })
      .then(response => {
        const dashboard = createDashboard(response.body, name);
        this.cache[name] = dashboard;
        console.log(`Data for ${name} cached.`);
        return Promise.resolve(dashboard);
      })
      .catch(err => {
        throw err;
      });
  }

  getDataForAll() {
    return Promise.all(urls.docNames().map(name => {
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