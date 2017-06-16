const footer = require('@ftchinese/ftc-footer')({theme: 'theme-light'});
const isProduction = process.env.NODE_ENV === 'production';

const env =  {
  urlPrefix: 'http://interactive.ftchinese.com/favicons',
  isProduction,
};

module.exports = {env, footer};