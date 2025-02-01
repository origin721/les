// @ts-check

import { create_http_server } from "./http_server/index.js";

main();

function main() {
  create_http_server({ port: 8000 });
}
