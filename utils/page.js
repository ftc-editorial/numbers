const debug = require('debug')('debug:render');
const path = require('path');
const nunjucks = require('nunjucks');
const moment = require('moment');

function todate(date) {
  return moment(date).format('YYYY年M月D日');
}

function replaceDate(str, date) {
  const mnt = moment(date);
  // Do not use moment().format(str) here as str is not predicatable and any character appeared may be replaced.
  debug(date);
  const timeStr = str.replace('YYYY', mnt.year()).replace('QQ', mnt.quarter());
  debug(timeStr)
  return timeStr;
}

class Page {
  constructor() {
    this.loaderOptions = process.env.NODE_ENV === 'production' 
      ? {} 
      : { noCache: true, watch: true };
  }
  
  get env() {
    const env = new nunjucks.Environment(
      new nunjucks.FileSystemLoader(
        [
          path.resolve(process.cwd(), 'views'),
          path.resolve(process.cwd(), 'node_modules/@ftchinese/ftc-footer'),
        ],
        this.loaderOptions
      ),
      {autoescape: false}
    );

    env
      .addFilter("todate", todate)
      .addFilter("replaceDate", replaceDate);
    return env;
  }

  render(template, context) {
    return new Promise((resolve, reject) => {
      this.env.render(template, context, function(err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
}

module.exports = new Page;