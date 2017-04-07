class Backoff extends EventEmitter {
  constructor(backoffStrategy) {
    super();
    this._backoffStrategy = BackoffStrategy;
    this._maxNumberOfRetry = 0;
    this._backoffNumber = 0;
    this._backoffDelay = 0;
    this._timeoutID = -1
    this.handlers = {
      backoff: this._onBackoff.bind(this)
    }
  }

  failAfter(maxNumberOfRetry) {
    this._maxNumberOfRetry = maxNumberOfRetry;
  }

  backoff(err) {
    if (this._backoffNumber === this._maxNumberOfRetry) {
      this.emit('fail', err);
      this.reset();
    } else {
      this._backoffDelay = this._backoffStrategy.next();
      this._timeoutID = setTimtout(this.handlers.backoff, this._backoffDelay);
      this.emit('backoff', err, this._backoffNumber, this._backoffDelay)
    }
  }

  _onBackoff() {
    this._timeoutID = -1;;
    this.emit('ready', this._backoffNumber, this._backoffDelay);
    this._backoffNumber++;
  }
  
  reset() {
    this._backoffNumber = 0;
    this._backoffStrategy.reset();
    clearTimeout(this._timeoutID);
    this._timeoutID = -1;
  }
}