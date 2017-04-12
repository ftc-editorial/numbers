const docs = {
  china: '1mzkZNKncQwrVuNw5GbwMYdY3rT54N8vaGXFEhjnJoJA',
  us: '10pU6IjKiPRxFICLuM-SnqDWH5Lwn2VbknAoFWR1F_-s'
};

class URL {
/*
 * @param {Object} docs - see above `docs`.
 */
  constructor(docs) {
    if (!docs || (typeof docs !== 'object')) {
      throw new Error('Argument required.');
    }
    this._docs = docs;
    this.docNames = Object.keys(this._docs);
  }

/* build a single url
 * @param {Boolean} republish - `true` to purge cache. Default `false`
 * @return {String | Null} - Bertha url for each country or null..
 */
  getUrlFor(name, republish=false) {
    const id = this._docs[name];
    if (id) {
      return `https://bertha.ig.ft.com/${republish ? 'republish' : 'view'}/publish/gss/${id}/data,credits,groups,options`;
    }
    return null;
  }

/*
 * @param {Boolean} republish
 * @return {Object}
 */
  getUrls(republish) {
    return Object.keys(this._docs).reduce((o, name) => {
      o[name] = this.getUrlFor(name, republish);
      return o;
    }, {});      
  }
}

module.exports = new URL(docs);