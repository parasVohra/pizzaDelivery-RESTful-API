/**
 *  Routes handling tasks
 *
 */

// Dependencies
const _data = require("./data");
const helpers = require("./helpers");

// Define the handler Container
const handlers = {};

// Users
handlers.users = function (data, callback) {
  const acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for users sub methods
handlers._users = {};

/**
 * @method: USERS - POST
 * @requires:  firstName, lastName, emailAddress, streetAddress, phone, password, tosAgreement
 */
handlers._users.post = (data, callback) => {
  // Check that all required fields are filled out
  let firstName =
    typeof data.payload.firstName == "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  let lastName =
    typeof data.payload.lastName == "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
  let emailAddress =
    typeof data.payload.emailAddress == "string" &&
    data.payload.emailAddress.trim().length > 0
      ? data.payload.emailAddress.trim()
      : false;
  let streetAddress =
    typeof data.payload.streetAddress == "string" &&
    data.payload.streetAddress.trim().length > 0
      ? data.payload.streetAddress.trim()
      : false;
  let phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone.trim()
      : false;
  let password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
  let tosAgreement =
    typeof data.payload.tosAgreement == "boolean" &&
    data.payload.tosAgreement == true
      ? true
      : false;
  if (
    firstName &&
    lastName &&
    phone &&
    emailAddress &&
    password &&
    streetAddress &&
    tosAgreement
  ) {
    _data.read("users", phone, (err, data) => {
      if (err) {
        // hash the password
        let hashedPassword = helpers.hash(password);

        //Create the user Object
        if (hashedPassword) {
          let userObject = {
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            emailAddress: emailAddress,
            streetAddress: streetAddress,
            hashedPassword: hashedPassword,
            tosAgreement: true,
          };
          //Store the User
          _data.create("users", phone, userObject, function (err) {
            if (!err) {
              callback(200);
            } else {
              callback(500, { Error: "Could not create the new user" });
            }
          });
        } else {
          callback(500, { Error: "Could not hash the user password" });
        }
      } else {
        callback(400, {
          Error: "A user with that phone number already exists",
        });
      }
    });
  } else {
    callback(400, { Error: "Missing require field" });
  }
};

/**
 * @method: USERS - GET
 * @requires: phone
 */
handlers._users.get = (data, callback) => {
  // Check that the phone number is valid
  let phone =
    typeof data.queryStringObject.phone == "string" &&
    data.queryStringObject.phone.trim().length == 10
      ? data.queryStringObject.phone.trim()
      : false;
  if (phone) {
    // Get the token from the headers
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

// Ping handler
handlers.ping = (data, callback) => {
  callback(200, { msg: "paras" });
};
// handle not found
handlers.notFound = (data, callback) => {
  callback(404, { msg: "Page not found" });
};

// export module
module.exports = handlers;
