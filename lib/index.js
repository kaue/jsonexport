/* jshint node:true */
'use strict';
/**
 * Module dependencies.
 */
const _ = require('underscore');
const Parser = require('./parser/json');
const Stream = require('./core/stream');

/**
 * Main function that converts json to csv
 *
 * @param {Object|Array} json
 * @param {Object} [options]
 * @param {Function} callback(err, csv) - Callback function
 *      if error, returning error in call back.
 *      if csv is created successfully, returning csv output to callback.
 */
module.exports = function(json, userOptions, callback) {
  if (_.isFunction(userOptions)) {
    callback = userOptions;
    userOptions = {};
  }
  userOptions = !callback ? json : userOptions; 
  let parser = new Parser(userOptions);
  if (!callback || !_.isFunction(callback)) return new Stream(parser);
  parser.parse(json, callback);
};
