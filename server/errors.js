exports.notFound = function notFound(m) {
  const err = new Error(m ? `${m} not found` : 'Not found');
  Error.captureStackTrace(err, notFound);
  err.name = 'NotFoundError';
  err.status = 404;
  return err;
}

exports.badServerResponse = function badServerResponse(m) {
  const err = new Error(m);
  Error.captureStackTrace(err, badServerResponse);
  err.name = 'BadServerResponseError';
  this.status = 500;
  return err;
}