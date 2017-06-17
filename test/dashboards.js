const debug = require('debug')('nums:test-dashboard');
const model = require('../model');
const writeJsonFile = require('write-json-file');
const path = require('path');
const dest = path.resolve(__dirname, '../.tmp');

async function dashboardsData() {
  model.republish = true;
  const dashboards = await model.getAllDashboards();
  for (let dashboard of dashboards) {
    debug(`Saving dashbaord for ${dashboard.name}`);
    await writeJsonFile(`${dest}/dashboard-${dashboard.name}.json`, dashboard.data)
  }
}

dashboardsData()
  .catch(err => {
    console.log(err);
  });