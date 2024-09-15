// @ts-check
const http = require('http');
const openpgp = require('openpgp');
const { v4: uuid } = require('uuid');

console.log(uuid());

/**
 * @typedef {Object} SendJsonDtoResponse
 * @prop {string} message
 * @prop {Date} date_created
 * @prop {number} activeUsers
 * @prop {string} user_id
 */

/**
 * @typedef {Object} SendJsonDtoParams
 * @prop {string} message
 */

/**
 * @typedef {Object} SendJsonParam
 * @prop {string} user_id
 * @prop {string} message
 */
/**
 * @typedef {(p: SendJsonDtoParams) => void} SendJson
 */
/**
 * @typedef {Object} ClientData
 * @prop {string} client_id
 * @prop {SendJson} send_json
 */
/**
 * @type {Record<string, ClientData>}
 */
const clients_by_id = {};

/**
 * @typedef {Object} RoomData
 * @prop {string} room_id
 * @prop {string[]} user_ids
 */
/**
 * @type {Record<string, RoomData>}
 */
const rooms_by_id = {};

const PATHS_POST_EVENTS = (/** @type {const} **/ {
  create_room: 'create_room',
});

/**
 * @typedef {Object} EventsReqBody
 * @prop {keyof typeof PATHS_POST_EVENTS} path
 */

const server = http.createServer((req, res) => {
  if (req.url === '/events' && req.method === 'POST') {

    /**
     * @param {EventsReqBody} body
     */
    function events_post_middleware(body) {
      if (!body) {
        res.writeHead(400);
        res.end("400 Bad Request");

        return;
      }

      switch (body.path) {
        case PATHS_POST_EVENTS.create_room: {

        }
        return;

      };
    };
    getRequestBody(req).then(events_post_middleware);
  }
  else if (req.url === '/events') {
    // Set headers for SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*', // Enable CORS if needed
    });



    const new_client_id = uuid();
    /**
     * @type {ClientData}
     */
    const new_client = {
      client_id: new_client_id,
      send_json: (p) => {
        /**
         * @type {SendJsonDtoResponse}
         */
        const _response = {
          message: p.message,
          date_created: new Date(),
          activeUsers: Object.keys(clients_by_id).length,
          user_id: new_client_id,
        }
        const message = `data: ${JSON.stringify(_response)}\n\n`;
        res.write(message);
      }
    };

    clients_by_id[new_client_id] = new_client;

    Object.values(clients_by_id).forEach((client_ctl) => {
      client_ctl.send_json({
        message: 'ok',
      })
    });


    // Clean up when client disconnects
    req.on('close', () => {
      delete clients_by_id[new_client_id]
      res.end();
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, World!');
  }
});

server.listen(8000, () => {
  console.log('Server running at http://localhost:8000/');
});

async function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body)); // Парсим JSON из тела
      } catch (error) {
        resolve(null); // В случае ошибки парсинга возвращаем null
      }
    });
    req.on('error', (err) => {
      reject(err); // Обработка ошибок во время получения данных
    });
  });
};