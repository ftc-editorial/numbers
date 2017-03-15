const cheerio = require('cheerio');

const className = {
  articleHead: '#main-title',
  articleLead: '.articlehead__lead', // extract html
  articleByline: '.articlehead__byline', // extract html
  section: '.card__group', // extract its id
  card: 'section.card', // extract color from its
  cardIndex: 'card--index',
  cardTitle: 'card__title', // extract text
  cardBody: '.card__body', // extract text from p
  headlineFigs: '.headline-figs', // get title attr
  bigNumHeading: '.bignum-heading', //get text
  bigNum: '.bignum', // get text
  smallFigs: '.small-figs', 
  
}
function extract(html) {
  const $ = cheerio.load(html);

}