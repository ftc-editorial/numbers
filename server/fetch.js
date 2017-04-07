const got = require('got');
const errors = require('../util/errors.js');
const createDashboard = require('./create-dashboard.js');

function dataUrl(key, republish) {
  return `https://bertha.ig.ft.com/${republish ? 'republish' : 'view'}/publish/gss/${key}/data,credits,groups,options`;
}

const urls = {
  china: dataUrl('1mzkZNKncQwrVuNw5GbwMYdY3rT54N8vaGXFEhjnJoJA')
};

const dashboards = {};

function fetch(name) {
  const dashboard = dashboards[name];

  if (dashboard) {
    return dashboard;
  }

  const url = urls[name];
  
  if (!url) {
    return Promise.reject(errors.notFound('Economy'));
  }

  return got(url, {
      json: true
    })
    .then(response => {
      const dashboard = createDashboard(response.body, name);
      dashboards[name] = dashboard;
      return dashboard;
    })
    .catch(err => {
      throw err;
    });
}

if (require.main === module) {
  fetch('china')
    .then(data => {
      console.log(dashboards);
      console.log(pollers);
    })
}

module.exports = fetch;
module.exports.urls = urls;