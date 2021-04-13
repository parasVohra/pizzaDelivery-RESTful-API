/**
 *  Server related tasks
 */

//Dependencies
const http = require("http");
const https = require("https");
const config = require("./config");
const path = require("path");
const { URL } = require("url");
const fs = require("fs");
const QueryString = require("querystring");
const util = require("util");
const debug = util.debuglog("server");
const StringDecoder = require("string_decoder").StringDecoder;
const handlers = require("./handlers");
const helpers = require("./helpers");

// Instantiate the server module object
const server = {};

// Instantiate the http server
server.httpServer = http.createServer((req, res) => {
  let protocol = "http://";
  server.unifiedServer(protocol, req, res);
});

// Instantiate the https
server.httpsServer = https.createServer(
  server.httpsServerOptions,
  (req, res) => {
    console.log(req);
    let protocol = "https://";
    server.unifiedServer(protocol, req, res);
  }
);

//Set the HTTPS sever options
server.httpsServerOptions = {
  key: fs.readFileSync(path.join(__dirname, "/../https/key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "/../https/cert.pem")),
};

// All server logic for http and https server
server.unifiedServer = (protocol, req, res) => {
  // Get url as an object
  const url = new URL(protocol + req.headers.host + req.url);

  //get path
  const path = url.pathname;
  const regex = /^\/|\/$/g;
  const trimmedPath = path.replace(regex, "");

  //Get the query string as an object
  const queryParams = new URLSearchParams(url.search);
  const queryStringObject = QueryString.parse(queryParams.toString());

  // get the HTTP method
  const method = req.method.toLowerCase();

  //get the headers as an object
  const headers = req.headers;

  // Get the payload if any
  const decoder = new StringDecoder("utf-8");
  let buffer = "";
  req.on("data", (data) => {
    buffer += decoder.write(data);
  });

  req.on("end", () => {
    buffer += decoder.end();

    // Choose the handler this request should go to. If one is not found use the notfound handler
    const chosenHandler =
      typeof server.router[trimmedPath] !== "undefined"
        ? server.router[trimmedPath]
        : handlers.notFound;
    // Construct the data object to send to the handler
    const data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      payload: helpers.parseJsonToObject(buffer),
    };

    // Route the request to handler specified in the router
    chosenHandler(data, (statusCode, payload) => {
      // Use the status code called back by the handler, or default to 200
      statusCode = typeof statusCode == "number" ? statusCode : 200;

      // Use the payload called back by the handler, or default to an empty object
      const payloadString = JSON.stringify(payload);

      //return the response
      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode);
      res.end(payloadString);

      //If the response is 200, print in green otherwise print in red

      statusCode === 200
        ? console.log(
            "\x1b[32m%s\x1b[0m",
            method.toUpperCase() + " /" + trimmedPath + " " + statusCode
          )
        : console.log(
            "\x1b[31m%s\x1b[0m",
            method.toUpperCase() + " /" + trimmedPath + " " + statusCode
          );
    });
  });
};

server.router = {
  ping: handlers.ping,
  users: handlers.users,
  tokens: handlers.tokens,
  menu: handlers.menu,
};

// Init Server script
// Init script
server.init = () => {
  // Start the HTTP server
  server.httpServer.listen(config.httpPort, () => {
    console.log(
      "\x1b[36m%s\x1b[0m",
      "The server is listening on port" + config.httpPort
    );
  });

  // Start the HTTPS server
  server.httpsServer.listen(config.httpsPort, () => {
    console.log(
      "\x1b[35m%s\x1b[0m",
      `server is listening on the port ${config.httpsPort}`
    );
  });
};

//export module
module.exports = server;
