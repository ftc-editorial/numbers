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
  ],
  deploy: {
    production: {
      user: "node",
      host: "nodeserver",
      ref: "origin/master",
      repo: "https://github.com/ftc-editorial/numbers.git",
      path: "/home/node/test",
      "pre-setup": "echo 'pre step'",
      "post-setup": "ls -la",
      "pre-deploy-local": "echo 'Begin to deploy'",
      "post-deploy": "npm install && npm run build && pm2 startOrRestart ecosystem.config.js --env production"
    }
  }
}
