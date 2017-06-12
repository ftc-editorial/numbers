const path = require('path');
const interpreter = path.resolve(process.env.HOME, '.nvm/versions/node/v7.10.0/bin/node');

module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [

    // First application
    {
      name      : "numbers",
      script    : "app.js",
      log_date_format: "YYYY-MM-DD HH:mm Z",
      interpreter: interpreter,
      env: {
        NODE_ENV: "development",
        PORT: 4001,
        DEBUG: "koa*,nums*"
      },
      env_production : {
        NODE_ENV: "production",
        PORT: 4001,
        DEBUG: "nums*"
      }
    }
  ]
}
