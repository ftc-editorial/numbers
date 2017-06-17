const bertha = require('../model/bertha.js');

console.log(bertha.docNames);
console.log(bertha.getUrlFor('china'));
console.log(bertha.getUrlFor('us', true));
console.log(bertha.getUrls(true));