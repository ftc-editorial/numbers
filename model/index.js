const debug = require('debug')('nums:model');
const got = require('got');
const writeJsonFile = require('write-json-file');
const path = require('path');
const autograph = require('./autograph-data.js');
const createDashboard = require('./create-dashboard.js');
const berthaUrl = require('./bertha-url.js');
const errors = require('../utils/errors.js');
const store = require('../utils/store');

class Model {
  constructor() {
// By default use bertha's cached data.    
    this.republish = false;
  }

/**
 * Fetch the JSON data from bertha for gss `name`
 * @param {String} name
 * @return {Promise<Object>}
 * @property {String} name
 * @property {Object} data - GSS transformaed by bertha. Each key is the worksheet name and value is the worksheet's col and row.
 */
  async fetchSheet(name) {
    const url = berthaUrl.getOneFor(name, this.republish);
    
    if (!url) {
      debug(`Economy for ${name} not found`);
       throw errors.notFound('Economy');
    }

    debug(`Fetching ${url}`);

    const sheetData = await got(url, {json: true})
      .then(res => {
        return res.body;
      });

    return {name, data: sheetData};
  }

/**
 * @return {Promise<Object[]>}
 */
  async fetchAllSheets() {
    const promisedSheets = berthaUrl.docNames.map(async name => {
      return await this.fetchSheet(name);
    });
    return await Promise.all(promisedSheets);
  }

/*
 * @param {String} name - one of the keys in `docs` of urls.js
 * @return {Promise<Object>}
 */
  async getDashboard(name) {
// Fetch `datasets` and a `spreadsheet` data in parallel
    const [rawSheet, numbers] = await Promise.all([
      this.fetchSheet(name),
      autograph.getData()
    ]);

    const dashboard = createDashboard({
      spreadsheet: rawSheet.data,
      name,
      numbers
    });

    return {name, data: dashboard};
  }

  async getAllDashboards() {
// Here we need to fetch latest first, and then fetch spreadsheet in parallel
    const numbers = await autograph.getData();

    debug('Fetching data for all dashboards');

    const rawSheets = await this.fetchAllSheets();

    return rawSheets.map(rawSheet => {
      const dashboard = createDashboard({
        spreadsheet: rawSheet.data,
        name: rawSheet.name,
        numbers
      });
      return {name: rawSheet.name, data: dashboard};
    });
  }

  static async init() {
    const model = new Model();
    model.republish = true;
    const dashboards = await model.getAllDashboards();
    await Promise.all(dashboards.map(async (dashboard) => {
      const filename = store.filenameFor(dashboard.name);
      debug(`Saving file ${filename}`);
      await writeJsonFile(filename, dashboard.data);
    }));
    return model;
  }
}

if (require.main === module) {
  Model.init()
    .catch(err => {
      console.log(err);
    });
}

module.exports = Model;