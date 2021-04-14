/**
 *  Helpers for various tasks
 */

//Dependencies
const crypto = require("crypto");
const config = require("./config");
const https = require("https");
const querystring = require("querystring");

// Container for all the helpers
const helpers = {};

//Parse a JSON string to an object is all cases, without throwing
helpers.parseJsonToObject = function (str) {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch (e) {
    return {};
  }
};

//Create a String of random alphanumeric characters, of a given length
helpers.createRandomString = function (strLength) {
  strLength = typeof strLength == "number" && strLength > 0 ? strLength : false;
  if (strLength) {
    // Define all the possible characters that could go into a string
    let possibleCharacters = "abcdefghijklmnopqrstuvwxyz0123456789";

    //Start the final String
    let str = "";
    for (let i = 1; i <= strLength; i++) {
      // Get a random character from the possibleCharacter string
      let randomCharacter = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length)
      );
      //Append this character to the final string
      str += randomCharacter;
    }
    // Return the final string
    return str;
  } else {
    false;
  }
};

//Create a SHA256 hash
helpers.hash = function (str) {
  if (typeof str == "string" && str.length > 0) {
    const hash = crypto
      .createHash("sha256", config.hashingSecret)
      .update(str)
      .digest("hex");
    return hash;
  } else {
  }
};

helpers.makePaymentAttempt = (amount, des, callback) => {
  let billAmount = typeof amount == "number" && amount > 0 ? amount : false;
  let description =
    typeof des == "string" && des.trim().length > 0 && des.trim().length <= 1600
      ? des
      : false;

  if (amount && description) {
    // Configuration the request payload
    let payload = {
      currency: "cad",
      source: "tok_visa",
      amount: billAmount,
      description: description,
      receipt_email: "pursharth01@gmail.com",
    };

    // Stringify the payload
    let stringPayload = querystring.stringify(payload);
    // Configure the request details
    let requestDetails = {
      protocol: "https:",
      hostname: "api.stripe.com",
      method: "POST",
      path: "/v1/charges",
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        Authorization: `Bearer ${config.stripe.secretKey}`,
        "Content-Length": Buffer.byteLength(stringPayload),
      },
    };
    // Instantiate the request object
    let req = https.request(requestDetails, (res) => {
      // Grab the status of the sent request
      let status = res.statusCode;
      //callback successfully if the request went through
      if (status == 200 || status == 201) {
        callback(true);
      } else {
        callback(false);
      }
    });

    //Bind to the error event so it doesn't get thrown
    req.on("error", function (err) {
      callback(false, err);
    });
    // Add the payload
    req.write(stringPayload);

    // End the request
    req.end();
  } else {
    callback("Given parameters were missing or invalid");
  }
};

//Export helpers
module.exports = helpers;
