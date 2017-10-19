const path = require('path');
const interpreter = path.resolve(process.env.HOME, 'n/n/versions/node/8.7.0/bin/node');

module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    {
      name      : "numbers",
      script    : "./app.js",
      cwd: __dirname,
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
      },
      max_restart: 10,
      error_file: path.resolve(process.env.HOME, 'logs/numbers-err.log'),
      out_file: path.resolve(process.env.HOME, 'logs/numbers-out.log')
    }
  ]
}
