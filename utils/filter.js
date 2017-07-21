const moment = require('moment');

const filters = {
  todate: function(date) {
    return moment(date).format('YYYY年M月D日');
  },
  replaceDate: function(str, date) {
    const mnt = moment(date);
    // Do not use moment().format(str) here as str is not predicatable and any character appeared may be replaced.
    console.log(date);
    const timeStr = str.replace('YYYY', mnt.year()).replace('QQ', mnt.quarter());
    console.log(timeStr)
    return timeStr;
  }
}

function register(env) {
  for(let k in filters) {
    if (!filters.hasOwnProperty(k)) {
      continue;
    }
    env.addFilter(k, filters[k]);
  }
}

module.exports = register;