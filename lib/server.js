/**
 *  Server related tasks
 */

//Dependencies
import http from "http";
import https from "https";
import url from "url";
import fs from "fs";
import config from "./config";

// Instantiate the server module object
const server = {};

// Instantiate the http server
server.httpServer = http.createServer((req, res) => {
  server.unifiedServer(req, res);
});

// All server logic for http and https server
server.unifiedServer = (req, res) => {
  // Get url as an object
  console.log(req);
};

// Init Server script
// Init script
server.init = () => {
  server.httpServer.listen(config.httpPort, () => {
    console.log(
      "\x1b[36m%s\x1b[0m",
      "The server is listening on port" + config.httpPort
    );
  });
};

//export module
