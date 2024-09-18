// @ts-check
const http = require('http');
const openpgp = require('openpgp');
const { post_middleware } = require('./post/middleware');
const { create_event_socket } = require('./create_event_socket');
const app_ref = require('./shared_service/app_ref');

module.exports = { create_http_server };

/**
 * @param {import('./CreateHttpServerParams')} p
 */
function create_http_server(p) {
  const server = http.createServer((req, res) => {
    /**
     * @type {HttpControllerParams}
     */
    const httpParams = { req, res };
    if (req.url === '/events' && req.method === 'POST') {
      post_middleware({httpParams, app_ref});
    }
    else if (req.url === '/events') {
      create_event_socket({httpParams, app_ref});
    }
    else { // TODO: поменять на 404
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Hello, World!');
    }
  });
  
  server.listen(p.port, () => {
    console.log(`Server running at http://localhost:${p.port}/`);
  });  
}



/**
 * @typedef {import('../types/HttpControllerParams')} HttpControllerParams
 */