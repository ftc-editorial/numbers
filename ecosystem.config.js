const path = require('path');
const interpreter = path.resolve(process.env.HOME, 'n/n/versions/node/8.1.0/bin/node');

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
