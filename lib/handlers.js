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
    let token =
      typeof data.headers.token == "string" ? data.headers.token : false;
    //Verify that the give token is valid for the phone number
    handlers._tokens.verifyToken(token, phone, function (tokenIsValid) {
      if (tokenIsValid) {
        // Lookup user
        _data.read("users", phone, function (err, data) {
          if (!err && data) {
            // Remove the hashed password from the user object before returning it to the requestor
            delete data.hashedPassword;
            callback(200, data);
          } else {
            callback(404);
          }
        });
      } else {
        callback(403, {
          Error: "Missing required token in header, or token is invalid",
        });
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

/**
 * @method : USERS - PUT
 * @requires : phone
 * @optional :  firstName, lastName, password, streetAddress, emailAddress (at least one must be specified)
 */
handlers._users.put = (data, callback) => {
  //Check for the required field
  let phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length == 10
      ? data.payload.phone.trim()
      : false;

  //Check for the optional fields

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
  let password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
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

  // Error if phone is invalid
  if (phone) {
    //error if nothing is sent to update
    if (firstName || lastName || password || emailAddress || streetAddress) {
      // Get the token from the headers
      let token =
        typeof data.headers.token == "string" ? data.headers.token : false;

      //Verify that the give token is valid for the phone number
      handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
        if (tokenIsValid) {
          // Lookup for user
          _data.read("users", phone, (err, userData) => {
            if (!err && userData) {
              //Update the fields necessary
              if (firstName) {
                userData.firstName = firstName;
              }
              if (lastName) {
                userData.lastName = lastName;
              }
              if (password) {
                userData.hashedPassword = helpers.hash(password);
              }
              if (emailAddress) {
                userData.emailAddress = emailAddress;
              }
              if (streetAddress) {
                userData.streetAddress = streetAddress;
              }

              // store the new updates
              _data.update("users", phone, userData, (err) => {
                if (!err) {
                  callback(200);
                } else {
                  console.log(err);
                  callback(500, { Error: "Could not update the user" });
                }
              });
            } else {
              callback(400, { Error: "The specified user does not exist" });
            }
          });
        } else {
          callback(403, {
            Error: "Missing required token in header, or token is invalid",
          });
        }
      });
    } else {
      callback(400, { Error: "Missing field to update" });
    }
  } else {
    callback(400, { Error: "Missing Required field" });
  }
};

/**
 * @method : USERS - DELETE
 * @required : phone
 */
handlers._users.delete = (data, callback) => {
  // Check that the phone number is valid
  let phone =
    typeof data.queryStringObject.phone == "string" &&
    data.queryStringObject.phone.trim().length == 10
      ? data.queryStringObject.phone.trim()
      : false;
  if (phone) {
    // Get the token from the headers
    let token =
      typeof data.headers.token == "string" ? data.headers.token : false;

    //Verify that the give token is valid for the phone number
    handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
        // Lookup user
        _data.read("users", phone, (err, userData) => {
          if (!err && userData) {
            _data.delete("users", phone, (err) => {
              if (!err) {
                // Delete each of the check associated with the user
                let userChecks =
                  typeof userData.checks == "object" &&
                  userData.checks instanceof Array
                    ? userData.checks
                    : [];
                let checksToDelete = userChecks.length;
                if (checksToDelete > 0) {
                  let checksDeleted = 0;
                  let deletionErrors = false;

                  //Loop through the checks
                  userChecks.forEach((checkId) => {
                    //Delete the Check
                    _data.delete("checks", checkId, (err) => {
                      if (err) {
                        deletionErrors = true;
                      }
                      checksDeleted++;
                      if (checksDeleted == checksToDelete) {
                        if (!deletionErrors) {
                          callback(200);
                        } else {
                          callback(500, {
                            Error:
                              "Error encountered  while attempting to delete all of the users checks, all checks may not have been delete successfully from the system ",
                          });
                        }
                      }
                    });
                  });
                } else {
                  callback(200);
                }
              } else {
                callback(500, {
                  Error: "Could not delete the specified user",
                });
              }
            });
          } else {
            callback(400, { Error: "Could not find the specified user" });
          }
        });
      } else {
        callback(403, {
          Error: "Missing required token in header, or token is invalid",
        });
      }
    });
  } else {
    callback(400, { Error: "Missing required filed" });
  }
};

// Tokens
handlers.tokens = (data, callback) => {
  const acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for all the tokens methods
handlers._tokens = {};

/**
 * @method: Tokens - POST
 * @requires: phone, password
 */
handlers._tokens.post = (data, callback) => {
  // Checking fields are valid
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
  if (password && phone) {
    //Lookup the user who matches that phone number
    _data.read("users", phone, (err, userData) => {
      if (!err && userData) {
        //Hash the sent password, and compare it to the password stored in the user object
        let hashedPassword = helpers.hash(password);
        if (hashedPassword == userData.hashedPassword) {
          // if valid create a new token with a random name. set expiration date 1 hr in the future
          let tokenId = helpers.createRandomString(20);
          let expires = Date.now() + 1000 * 60 * 60;
          let tokenObject = {
            phone: phone,
            id: tokenId,
            expires: expires,
          };

          //Store the token
          _data.create("tokens", tokenId, tokenObject, (err) => {
            if (!err) {
              callback(200, tokenObject);
            } else {
              callback(500, { Error: "Could not create the new token" });
            }
          });
        } else {
          callback(400, {
            Error: "Password did not match the specified stored password",
          });
        }
      } else {
        callback(400, { Error: "Could not found the specified user" });
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

/**
 * @method: Tokens - Get
 * @requires: id
 */
handlers._tokens.get = (data, callback) => {
  // Check that the phone number is valid
  let id =
    typeof data.queryStringObject.id == "string" &&
    data.queryStringObject.id.trim().length == 20
      ? data.queryStringObject.id.trim()
      : false;
  if (id) {
    // Lookup Token
    _data.read("tokens", id, function (err, tokenData) {
      if (!err && tokenData) {
        // Remove the hashed password from the user object before returning it to the requestor
        delete data.hashedPassword;
        callback(200, tokenData);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

/**
 *
 * @method : Tokens - PUT
 * @requires: id
 */
handlers._tokens.put = (data, callback) => {
  let id =
    typeof data.payload.id == "string" && data.payload.id.trim().length == 20
      ? data.payload.id.trim()
      : false;
  let extend =
    typeof data.payload.extend == "boolean" && data.payload.extend == true
      ? true
      : false;
  if (id && extend) {
    // Lookup the token
    _data.read("tokens", id, (err, tokenData) => {
      if (!err && tokenData) {
        //check to make sure the token isn't already expired
        if (tokenData.expires > Date.now()) {
          //Set the expiration an hour from now
          tokenData.expires = Date.now() + 1000 * 60 * 60;

          //Store the new updates
          _data.update("tokens", id, tokenData, function (err) {
            if (!err) {
              callback(200);
            } else {
              callback(500, {
                Error: "Could not update the token's expiration",
              });
            }
          });
        } else {
          callback(400, {
            Error: "The token has already expired, and cannot be extended",
          });
        }
      } else {
        callback(400, { Error: "Specified token does not Exist" });
      }
    });
  } else {
    callback(400, {
      Error: "Missing required field(s) or field(s) are invalid ",
    });
  }
};

/**
 * @methods : Tokens - DELETE
 * @requires: id
 */
handlers._tokens.delete = (data, callback) => {
  // Check that the ID is valid
  let id =
    typeof data.queryStringObject.id == "string" &&
    data.queryStringObject.id.trim().length == 20
      ? data.queryStringObject.id.trim()
      : false;

  if (id) {
    // Lookup the token
    _data.read("tokens", id, (err, data) => {
      if (!err && data) {
        _data.delete("tokens", id, function (err) {
          if (!err) {
            callback(200);
          } else {
            callback(500, { Error: "Could not delete the specified token" });
          }
        });
      } else {
        callback(400, { Error: "Could not find the specified token" });
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

// Container for all the menu methods
handlers._menu = {};

// create a menu item get handler
// should able to get menu items if user is logged in
handlers.menu = function (data, callback) {
  const acceptableMethods = ["get"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._menu[data.method](data, callback);
  } else {
    callback(405);
  }
};

/**
 * @method : MENU - GET
 * @requires : id
 */
handlers._menu.get = (data, callback) => {
  // Check that token is valid
  let token =
    typeof data.headers.token == "string" ? data.headers.token : false;
  if (token) {
    //Verify that the give token is valid
    handlers._tokens.verifyToken(token, (tokenIsValid) => {
      if (tokenIsValid) {
        // Get menu items
        _data.read("items", "menuItems", (err, menuItems) => {
          if (!err && menuItems) {
            // Return menuItems
            callback(200, menuItems);
          } else {
            callback(404);
          }
        });
      } else {
        callback(403);
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

// create a order post handler
// should be able to fill a shopping cart with menu items
handlers._shoppingCart = {};

handlers.shoppingCart = (data, callback) => {
  const acceptableMethods = ["post"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._shoppingCart[data.method](data, callback);
  } else {
    callback(405);
  }
};

/**
 * @method : ShoppingCart - POST
 * @required: id , cartItems
 */
handlers._shoppingCart.post = (data, callback) => {
  // Check that token is valid
  let token =
    typeof data.headers.token == "string" ? data.headers.token : false;
  let cartItems =
    typeof data.payload.cartItems == "object" &&
    data.payload.cartItems instanceof Array &&
    data.payload.cartItems.length > 0
      ? data.payload.cartItems
      : false;

  if (token && cartItems) {
    //Verify that the give token is valid
    handlers._tokens.verifyToken(token, (tokenIsValid) => {
      if (tokenIsValid) {
        handlers._tokens.getUserPhone(token, (userPhone) => {
          if (userPhone) {
            // Check if cart exists for the user
            handlers._shoppingCart.findShoppingCart(
              userPhone,
              (userHasCart, cartData) => {
                if (userHasCart) {
                  let newItems = cartData;

                  cartItems.forEach((item) => {
                    newItems.Items.push(item);
                  });

                  // Save new items in cart
                  _data.update("cart", userPhone, newItems, (err) => {
                    if (!err) {
                      callback(200);
                    } else {
                      callback(500, {
                        Error: "Could not update the cart with the new items",
                      });
                    }
                  });
                } else {
                  // create new cart and items
                  handlers._shoppingCart.createShoppingCart(
                    userPhone,
                    { Items: cartItems },
                    (err) => {
                      if (!err) {
                        callback(200);
                      } else {
                        callback(403, {
                          Error: "Error while create a new cart for user",
                        });
                      }
                    }
                  );
                }
              }
            );
          } else {
            callback(403, { Error: "Didn't get the user phone number" });
          }
        });
      } else {
        callback(403, { Error: "Token is Invalid" });
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

// user should able to create an order.
handlers._order = {};
// should integrate with the Sandbox of stripe to accept payment
handlers.order = (data, callback) => {
  const acceptableMethods = ["post"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._order[data.method](data, callback);
  } else {
    callback(405);
  }
};

/**
 * @method : order - POST
 * @requires : id
 */
handlers._order.post = (data, callback) => {
  //check for valid token
  // Check that token is valid
  let token =
    typeof data.headers.token == "string" ? data.headers.token : false;

  if (token) {
    handlers._tokens.verifyToken(token, (tokenIsValid, tokenData) => {
      // if token is valid get user phone
      if (tokenIsValid && tokenData) {
        let userPhone = tokenData.phone;

        // get all shopping cart item related to the user
        handlers._shoppingCart.findShoppingCart(
          userPhone,
          (userHasCart, cartData) => {
            // if cart items found calculate the bill for user
            if (userHasCart) {
              let initialAmount = 0;
              let billAmount = cartData.Items.reduce(
                (accumulator, currentValue) => {
                  return accumulator + currentValue.price;
                },
                initialAmount
              );

              let description = `Order payed by ${userPhone}`;

              // Initiate the payment method using stripe
              // method should return true or false

              helpers.makePaymentAttempt(
                billAmount,
                description,
                (isPaymentDone) => {
                  if (isPaymentDone) {
                    // Make receipt object
                    let receipt = `AmountPaid:C$ ${billAmount}.00 \n Payment Method is Visa `;
                    //initiate the send receipt method
                    helpers.sendReceiptByEmail(receipt, (isEmailSent) => {
                      if (isEmailSent) {
                        callback(200, {
                          message:
                            "Payment Done and receipt  has been sent to user",
                        });
                      } else {
                        callback(403, { Error: "Error while sending mail" });
                      }
                    });
                  } else {
                    callback(403, { Error: "Error while making payment" });
                  }
                }
              );
            } else {
              callback(403, { Error: "Cart items not found" });
            }
          }
        );
      } else {
        callback(403, { Error: "Token is Invalid" });
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

// when order is placed, you should email user a receipt.
// Should integrate with mail gun

/**
 * @method: Tokens - Verify
 * @requires: id, phone
 */
// Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = function (id, callback) {
  // Lookup the token
  _data.read("tokens", id, function (err, tokenData) {
    if (!err && tokenData) {
      // Check that the token has not expired
      if (tokenData.expires > Date.now()) {
        callback(true, tokenData);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

// Get user phone number from the token
handlers._tokens.getUserPhone = function (id, callback) {
  // Lookup the token
  _data.read("tokens", id, function (err, tokenData) {
    if (!err && tokenData) {
      // Check that the token has not expired
      if (tokenData.expires > Date.now()) {
        callback(tokenData.phone);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

handlers._shoppingCart.findShoppingCart = (phone, callback) => {
  // Look up user cart by reading file named by user's phone
  _data.read("cart", phone, (err, cartData) => {
    if (!err && cartData) {
      callback(true, cartData);
    } else {
      callback(false, cartData);
    }
  });
};

handlers._shoppingCart.createShoppingCart = (phone, cartItems, callback) => {
  //create user cart file name by using user's phone
  _data.create("cart", phone, cartItems, (err) => {
    if (!err) {
      callback(200);
    } else {
      callback(500, {
        Error: "Could not update the user with the new Check",
      });
    }
  });
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
