// @ts-check

const { create_http_server } = require("./http_server");



main();

function main() {
  create_http_server({ port: 8000 });
}