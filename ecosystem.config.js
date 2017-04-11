const path = require('path');
const interpreter = path.resolve(process.env.HOME, 'n/versions/node/7.8.0/bin/node');

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
        DEBUG: "numbers"
      },
      env_production : {
        NODE_ENV: "production",
        PORT: 4001
      }
    }
  ]
}
