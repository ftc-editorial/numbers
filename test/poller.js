const got = require('got');
const backoff = require('backoff');
const debug = require('debug')('poller');

const global_poll_interval = process.env.POLL_INTERVAL ? parseInt(process.env.POLL_INTERVAL) : 10000;

class Poller {
  constructor(url, options={}) {
    this.url = url;
    this.status = {
      on: false,
      since: new Date()
    };

    this.interval = options.interval || global_poll_interval;
    this.timeout = options.timeout;

    this.last = {};
    this.isStopped = true;

    let fibonacciBackoff = backoff.fibonacci({
      randomisationFactor: 0.2,
      initialDelay: this.interval * 2,
      maxDelay: this.interval * 50
    });
    fibonacciBackoff.failAfter(10);
    fibonacciBackoff.on('backoff', (number, delay) => {
      console.log(`Request round ${number}. Retry in ${delay}ms`);
    });
    fibonacciBackoff.on('ready', (number, delay) => {
      this.request();
    });
    fibonacciBackoff.on('fail', () => {
      console.log(`Failed on ${new Date()}. Abort.`);
    });
    this.backoff = fibonacciBackoff;
  }

  request(success, fail) {
    debug(`Request ${this.url}`);
    let noop = () => {};
    success = success || noop;
    fail = fail || noop;
    return got(this.url, {
        json: true,
        timeout: this.timeout
      })
      .then(response => {
        debug(`Response ${response.url}, status ${response.statusCode}`);
        this.last = {
          time: new Date()
        };
        success();
        return response.body;
      })
      .catch(err => {
        debug(`Error: ${err}`);
        fail();
        this.backoff.backoff();
        throw err;
      });
  }

  stop() {
    debug(`Stop ${this.url}`);
    this.status = {
      on: false,
      since: new Date()
    };
  }

  start() {
    debug(`Start ${this.url}`);
    this.status = {
      on: true,
      since: new Date()
    };
    return this.request();
  }
}

if (require.main === module) {
  const url = 'https://bertha.ig.ft.com/republish/publish/gss/1mzkZNKncQwrVuNw5GbwMYdY3rT54N8vaGXFEhjnJoJA/data,credits,groups,options';
  const testurl = 'http://interactive.ftchinese.com/ftc-footer/stats.json';
  const poller = new Poller(testurl, {
    interval: 500,
    timtout: 10000
  });
  poller.start()
    .then(data => {
      console.log(data);
    })
    .catch(err => {
      console.log(err);
    });
}