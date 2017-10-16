const path = require('path');

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
      interpreter: "node@8.7.0",
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
      "post-deploy": "echo $PATH && npm install --production && npm run build && pm2 startOrRestart ecosystem.config.js --env production"
    }
  }
}
