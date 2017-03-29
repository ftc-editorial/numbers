function dataUrl(key, republish) {
  return `https://bertha.ig.ft.com/${republish ? 'republish' : 'view'}/publish/gss/${key}/data,credits,groups,options`;
}

const docId = {
  china: '1mzkZNKncQwrVuNw5GbwMYdY3rT54N8vaGXFEhjnJoJA',
  us: '',
  uk: '',
  japan: ''
};

if (require.main === module) {
  const path = require('path');
  const got = require('got');
  const writeJsonFile = require('write-json-file');
  const dataUrl = 'https://bertha.ig.ft.com/republish/publish/gss/1mzkZNKncQwrVuNw5GbwMYdY3rT54N8vaGXFEhjnJoJA/data,credits,groups,options';
  const dest = path.resolve(__dirname, '../data');
  got(dataUrl, {
    json: true
  })
  .then(res => {
    return writeJsonFile(`${dest}/china.json`, res.body);
  })
  .catch(err => {
    console.log(err);
  });
}