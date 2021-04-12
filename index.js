/**
 * primary file for api
 */

// Dependencies
const server = require("./lib/server");

// Declare app
const app = {};

// init function
app.init = () => {
  //Start the server
  server.init();
};

// Execute init
app.init();

// Export the app
module.exports = app;
