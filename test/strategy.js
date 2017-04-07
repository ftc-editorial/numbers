class BackoffStrategy {
/**
 * @param {Object} options
 * @param {Number} options.initialDeplay - milliseconds
 * @param {Number} options.maxDelay - milliseconds
 * @param {Generator} optoins.strategy
 */
  constructor({initialDelay=100, maxDelay=10000, strategy, task}={}) {
    this.initialDelay = initialDelay;
    this.maxDelay = maxDelay;
    this.strategy = strategy(this.initialDelay);
  }

  next() {
    const nextDelay =  this.strategy.next().value;
    return nextDelay > maxDelay ? maxDelay : nextDelay;
  }

  reset() {
    this.strategy = strategy(this.initialDelay);
  }

  exec() {
    return task()
      .catch(err => {
        this.timeoutID = setTimeout(this.exec, )
      })
  }
}

class FibonacciBackoffStrategy extends BackoffStrategy {
  constructor(options) {
    super(options);
    this._backoffDelay = 0;
    this._nextBackoffDelay = this.getInitialDelay();
  }

  _next() {
    const backoffDelay = Math.min(this._nextBackoffDelay, this.getMaxDelay());
    this._nextBackoffDelay += this._backoffDelay;
    this.backoffDelay = backoffDelay;
    return backoffDelay;
  }

  _reset() {
    this._nextBackoffDelay = this.getInitialDelay();
    this._backoffDelay = 0;
  }
}