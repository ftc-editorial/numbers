const urls = require('../server/urls.js');

console.log(urls.one('china'));
console.log(urls.one('us', true));
console.log(urls.all());
console.log(urls.all(true));