const docs = {
  china: '1mzkZNKncQwrVuNw5GbwMYdY3rT54N8vaGXFEhjnJoJA',
  us: '10pU6IjKiPRxFICLuM-SnqDWH5Lwn2VbknAoFWR1F_-s'
};

/**
 * Use GSS id to build bertha url
 */
class BerthaUrl {
/*
 * @param {Object} docs - see above `docs`.
 */
  constructor(docs) {
    if (!docs || (typeof docs !== 'object')) {
      throw new Error('Argument required.');
    }
    this._docs = docs;
  }
/**
 * @return {Array} - keys of `docs`
 */
  get docNames() {
    return Object.keys(this._docs)
  }

/* build a single url
 * @param {String} key - The key in `docs`
 * @param {Boolean} republish - `true` to purge cache. Default `false`
 * @return {String | Null} - Bertha url for each country or null..
 */
  getOneFor(key, republish=false) {
    const id = this._docs[key];
    if (id) {
      return `https://bertha.ig.ft.com/${republish ? 'republish' : 'view'}/publish/gss/${id}/data,credits,groups,options`;
    }
    return null;
  }

/*
 * @param {Boolean} republish
 * @return {Object}
 */
  getAll(republish) {
    const docUrls = {};
    for (let key of this.docNames) {
      docUrls[key] = this.getUrlFor(key, republish);
    }
    return docUrls;    
  }
}

module.exports = new BerthaUrl(docs);