// @ts-check
const http = require('http');
const openpgp = require('openpgp');
const { v4: uuid } = require('uuid');

console.log(uuid());
const CLIENT_PATHS = Object.freeze(/** @type {const} */{
  connect_success: 'connect_success',
  ping: 'ping',
});
/**
 * @typedef {EventResponseDto_create_room} EventResponseDto
 */
/**
 * @typedef {Object} EventResponseDto_create_room
 * @prop {string} path
 */
/**
 * @typedef {PayloadByConnectSuccess|PayloadByPing} AllClientPayloads
 */
/**
 * @typedef {undefined} PayloadByPing
 */
/**
 * @typedef {Object} PayloadByConnectSuccess
 * @prop {string} user_id это id сгенерировано сервером
 * для клиента, сам клиент не мог его сгенерировать, клиенту не терять
 * так как повторно не высылается
 * 
 */
/**
 * @typedef {Object} SendJsonDtoResponse
 * @prop {keyof typeof CLIENT_PATHS} path
 * @prop {AllClientPayloads} payload
 * @prop {Date} date_created
 * @prop {number} active_users
 */

/**
 * @typedef {Object} SendJsonDtoParams
 * @prop {AllClientPayloads} payload
 * @prop {keyof typeof CLIENT_PATHS} path
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
 * @prop {string} client_id будущем будет hex_pub_key_client_id
 * @prop {SendJson} send_json
 */
/**
 * @type {Record<string, ClientData>}
 */
const clients_by_id = {};

/**
 * @typedef {Object} RoomData
 * @typedef {string} message;
 * @prop {string} room_id
 * @prop {string} registration_id
 * @prop {string} owner_id
 * @prop {string[]} user_ids
 * @prop {Date} created_date - client send
 */
/**
 * @type {Record<string, RoomData>}
 */
const rooms_by_id = {};

const PATHS_POST_EVENTS = Object.freeze(/** @type {const} **/ {
  create_room: 'create_room',
});

/**
 * @typedef {Object} EventsReqBody
 * @prop {keyof typeof PATHS_POST_EVENTS} path
 * @prop {RoomData} params
 */

const server = http.createServer((req, res) => {
  const httpParams = { req, res };
  if (req.url === '/events' && req.method === 'POST') {
    post_middleware(httpParams);
  }
  else if (req.url === '/events') {
    create_event_socket(httpParams);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, World!');
  }
});

server.listen(8000, () => {
  console.log('Server running at http://localhost:8000/');
});

async function get_request_body(req) {
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


function check_validation(cb) {
  try {
    return cb();
  }
  catch (err) {
    return null;
  }
}

/**
 * @typedef {Object}  HttpControllerParams
 * @prop {http.IncomingMessage} req 
 * @prop {http.ServerResponse<http.IncomingMessage>
 * & {req: http.IncomingMessage;}
 * } res 
 */
/**
 * 
 * @param {HttpControllerParams} httpParams 
 */
function create_event_socket(httpParams) {
  // Set headers for SSE
  httpParams.res.writeHead(200, {
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
        path: p.path,
        payload: p.payload,
        date_created: new Date(),
        active_users: Object.keys(clients_by_id).length,
      }
      const message = `data: ${JSON.stringify(_response)}\n\n`;
      httpParams.res.write(message);
    }
  };

  // user_id: new_client_id;

  /**
   * @type {PayloadByConnectSuccess}
   */
  const payload_connect = {
    user_id: new_client_id,
  }
  new_client.send_json({
    payload: payload_connect,
    path: CLIENT_PATHS.connect_success,
  })

  clients_by_id[new_client_id] = new_client;

  /**
   * @type {PayloadByPing}
   */
  const payloadPing = undefined;

  Object.values(clients_by_id).forEach((client_ctl) => {
    client_ctl.send_json({
      payload: payloadPing,
      path: CLIENT_PATHS.ping,
    })
  });


  // Clean up when client disconnects
  httpParams.req.on('close', () => {
    delete clients_by_id[new_client_id]
    httpParams.res.end();
  });
}

/**
 * 
 * @param {HttpControllerParams} httpParams 
 */
function post_middleware(httpParams) {
  get_request_body(httpParams.req).then(events_post_middleware);


  /**
   * @param {EventsReqBody} body
   */
  function events_post_middleware(body) {
    const is_valid_body = check_validation(() => {
      return (/** @see {EventsReqBody} */
        typeof body.path === 'string'
        && typeof body.params.room_id === 'string'
        && typeof body.params.owner_id === 'string'
        && body.params.user_ids.every(u => typeof u === 'string')
      );
    });
    if (!is_valid_body) {
      httpParams.res.writeHead(400);
      httpParams.res.end("400 Bad Request");

      return;
    }

    switch (body.path) {
      case PATHS_POST_EVENTS.create_room: {
        rooms_by_id[body.params.room_id] = body.params;
        console.log('add room: ', rooms_by_id);
        httpParams.res.writeHead(201);
        httpParams.res.write("");
      }
        break;
      default:
        httpParams.res.writeHead(404);
        httpParams.res.write("");
    };
    return;
  };
}