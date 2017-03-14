const got = require('got')
const extract = require('./extract.js');
const url = 'https://ig.ft.com/sites/numbers/economies/china';

got(url)
  .then(res => {

  })
  .catch(err => {
    throw err;
  });