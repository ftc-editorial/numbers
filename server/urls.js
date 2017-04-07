const docs = {
  china: '1mzkZNKncQwrVuNw5GbwMYdY3rT54N8vaGXFEhjnJoJA',
  us: '1bstjNTZcGfU6dCcaQAiMRqenaYElxL0cyQPpLOV1Lz0'
};

class URL {
/*
 * @param {Object} docs - see above `docs`.
 */
  constructor(docs) {
    if (typeof docs !== 'object') {
      throw new Error('Options must be an object');
    }
    this._docs = docs;
  }

/* build a single url
 * @param {Boolean} republish - `true` to purge cache. Default `false`
 * @return {String | Null} - Bertha url for each country or null..
 */
  one(name, republish=false) {
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
  all(republish) {
    return Object.keys(this._docs).reduce((o, name) => {
      o[name] = this.one(name, republish);
      return o;
    }, {});      
  }

  docNames() {
    return Object.keys(this._docs);
  }
}

module.exports = new URL(docs);