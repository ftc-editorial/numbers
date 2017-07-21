const page = require('../utils/page.js');

const messages = {
  403: 'Forbidden',
  404: 'Not Found',
  500: 'Server Error'
};

async function handleErrors (ctx, next) {
  try {
// Catch all errors from downstream    
    await next();
  } catch (e) {
    const status = e.status || 500;
// Do not output error detail in production env.
    const data = (process.env.NODE_ENV === 'production') ? {
      message: messages[status],
      error:  {}
    } : {
      message: e.message,
      error: e
    };
    ctx.response.status = status;
    ctx.body = await page.render('error.html', data);
  }
}

module.exports = handleErrors;