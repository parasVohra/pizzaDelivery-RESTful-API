/**
 *  Library for storing and editing data
 */

// Dependencies
const fs = require("fs");
const path = require("path");
const helpers = require("./helpers");

// Container for the module
const lib = {};

// Base directory of the data folder
lib.baseDir = path.join(__dirname, "/../.data/");

lib.create = (dir, file, data, callback) => {
  let path = lib.baseDir + "/" + file + ".json";
  fs.open(
    lib.baseDir + dir + "/" + file + ".json",
    "wx",
    (err, fileDescriptor) => {
      if (!err && fileDescriptor) {
        // Convert data to string
        let stringData = JSON.stringify(data);

        // Write to file and close it
        fs.writeFile(fileDescriptor, stringData, (err) => {
          if (!err) {
            fs.close(fileDescriptor, (err) => {
              if (!err) {
                callback(false);
              } else {
                callback("error closing new file");
              }
            });
          } else {
            callback("error writing to new file");
          }
        });
      } else {
        callback("Could not crete new file, it may already exit:" + err);
      }
    }
  );
};

//Read data from file
lib.read = function (dir, file, callback) {
  fs.readFile(
    lib.baseDir + dir + "/" + file + ".json",
    "utf-8",
    function (err, data) {
      if (!err && data) {
        let parsedData = helpers.parseJsonToObject(data);
        callback(false, parsedData);
      } else {
        callback(err, data);
      }
    }
  );
};

//Update data inside a file
lib.update = function (dir, file, data, callback) {
  //open the file for writing
  fs.open(
    lib.baseDir + dir + "/" + file + ".json",
    "r+",
    function (err, fileDescriptor) {
      if (!err && fileDescriptor) {
        //Convert data to string
        const stringData = JSON.stringify(data);

        //Truncate the file
        fs.ftruncate(fileDescriptor, function (err) {
          if (!err) {
            //Write to the file and close it
            fs.writeFile(fileDescriptor, stringData, function (err) {
              if (!err) {
                fs.close(fileDescriptor, function (err) {
                  if (!err) {
                    callback(false);
                  } else {
                    callback("error closing existing file");
                  }
                });
              }
            });
          } else {
            callback("Error truncating file");
          }
        });
      } else {
        callback("Could not open the file for updating, it may not exist yet");
      }
    }
  );
};

//Delete a file
lib.delete = function (dir, file, callback) {
  //unlink the file
  fs.unlink(lib.baseDir + dir + "/" + file + ".json", function (err) {
    if (!err) {
      callback(false);
    } else {
      callback("error deleting file");
    }
  });
};

// List all the items in the directory
lib.list = function (dir, callback) {
  fs.readdir(lib.baseDir + dir + "/", function (err, data) {
    if (!err && data & (data.length > 0)) {
      let trimmedFileNames = [];
      data.forEach((fileName) => {
        trimmedFileNames.push(fileName.replace(".json"));
      });
      callback(false, trimmedFileNames);
    } else {
      callback(err, data);
    }
  });
};

// Export lib module
module.exports = lib;
