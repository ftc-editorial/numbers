const http = require('http');
const debug = require('debug')('http');
const name = 'My App';

debug('booting %s', name);

http.createServer((req, res) => {
  debug(req.method + ' ' + req.url);
  res.end('hello\n');
}).listen(3001, () => {
  debug('listening');
});