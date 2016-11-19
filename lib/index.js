/* jshint node:true */
'use strict';
/**
 * Module dependencies.
 */
var os = require('os');
var _ = require('underscore');

var joinRows = require('./joinRows');
var generateHeaders = require('./generateHeaders');

var options;

/**
 * Main function that converts json to csv
 *
 * @param {Object|Array} json
 * @param {Object} [options]
 * @param {Function} callback(err, csv) - Callback function
 *      if error, returning error in call back.
 *      if csv is created successfully, returning csv output to callback.
 */
module.exports = function(json,userOptions,callback) {
    callback = callback ? callback : function(){};
    if(_.isFunction(userOptions)) {
      callback = userOptions;
      userOptions = {};
    }

    options = parseOptions(userOptions);
    generateCsv(json, callback);
};
/**
 * Replaces the default options with the custom user options
 *
 * @param {Options} userOptions
 */
function parseOptions(userOptions){
    /**
     * Default options
     */
    var defaultOptions = {
        headerPathString: '.', //       String
        rowDelimiter: ',', //           String
        textDelimiter: '"', //           String
        arrayPathString: ';', //        String
        undefinedString: '', //         String
        endOfLine: null, //             String
        mainPathItem: null, //          String
        booleanTrueString: null, //     String
        booleanFalseString: null, //    String
        includeHeaders: true, //        Boolean
        orderHeaders: false, //          Boolean
        verticalOutput: true, //        Boolean
        //Handlers
        handleString: null, //          Function
        handleNumber: null, //          Function
        handleBoolean: null, //         Function
        handleDate: null, //            Function
        //handleArray: null, //           Function
        //handleObject: null //           Function
    };
    return _.extend(defaultOptions, userOptions);
}
/**
 * Generates a CSV file with optional headers based on the passed JSON,
 * with can be an Object or Array.
 *
 * @param {Object|Array} json
 * @param {Function} callback(err,csv) - Callback function
 *      if error, returning error in call back.
 *      if csv is created successfully, returning csv output to callback.
 */
function generateCsv(json, callback) {
    if(_.isArray(json)){
      return callback(null, generateFromArray(json));
    }
    else if(_.isObject(json)){
        return callback(null, generateFromObject(json));
    }

    return callback(new Error('Unable to parse the JSON object, its not an Array or Object.'));
}

function generateFromArray(json) {
  var fileRows = [];
  var parseResult = [];
  var outputFile;
  var fillRows;
  json.forEach(function (item) {
      //Call checkType to list all items inside this object
      //Items are returned as a object {item: 'Prop Value, Item Name',
      //                                value: 'Prop Data Value'}
      var itemResult = checkType(item, options.mainPathItem);
      parseResult.push(itemResult);
  });

  //Generate the csv headers based on prop usage over the elements
  var headers = generateHeaders(parseResult);
  //Generate the csv output

  if(options.includeHeaders){
      //Add the headers to the first line
      fileRows.push(headers.join(options.rowDelimiter));
  }

  fillRows = function (result) {
      //Initialize the array with empty strings to handle 'unpopular' headers
      var resultRows = [Array(headers.length).join(".").split(".")];

      result.forEach(function(element){
          var placed = false;
          resultRows.forEach(function (row) {
              if(!placed && row[headers.indexOf(element.item)] === ''){
                  row[headers.indexOf(element.item)] = element.value;
                  placed = true;
              }
          });

          if(!placed){
              var newRow = Array(headers.length).join(".").split(".");
              newRow[headers.indexOf(element.item)] = element.value;
              resultRows.push(newRow);
          }
      });
      resultRows.forEach(function (row) {
          fileRows.push(row.join(options.rowDelimiter));
      });
  };

  parseResult.forEach(fillRows);
  return joinRows(fileRows, options.endOfLine);
}

function generateFromObject(json) {
  var fileRows = [];
  var parseResult = [];
  var outputFile;
  var fillRows;

  var horizontalRows = [[],[]];
  var textDelimiterRegex = new RegExp("\\" + options.textDelimiter, 'g');
  var endOfLine = options.endOfLine || os.EOL || '\n';
  fillRows = function (result) {

      var value = result.value ? result.value.toString() : options.undefinedString;
      // Escape the textDelimiters contained in the field
      /*(https://tools.ietf.org/html/rfc4180)
         7.  If double-quotes are used to enclose fields, then a double-quote
         appearing inside a field must be escaped by preceding it with
         another double quote.
         For example: "aaa","b""bb","ccc"
      */
      value = value.replace(textDelimiterRegex, options.textDelimiter+options.textDelimiter);
      // Escape the whole field if it contains a rowDelimiter or a linebreak
      if (value.indexOf(options.rowDelimiter) >= 0 || value.indexOf(endOfLine) >= 0) {
        value = options.textDelimiter + value + options.textDelimiter;
      }
      //Type header;value
      if(options.verticalOutput){
          var row = [result.item, value];
          fileRows.push(row.join(options.rowDelimiter));
      }else{
          horizontalRows[0].push(result.item);
          horizontalRows[1].push(value);
      }
  };
  for(var prop in json){
      var prefix = "";
      if(options.mainPathItem)
          prefix = options.mainPathItem + options.headerPathString;
      parseResult = checkType(json[prop], prefix + prop);

      parseResult.forEach(fillRows);
  }
  if(!options.verticalOutput){
      fileRows.push(horizontalRows[0].join(options.rowDelimiter));
      fileRows.push(horizontalRows[1].join(options.rowDelimiter));
  }
  return joinRows(fileRows, options.endOfLine);
}
/**
 * Check the element type of the element call the correct handle function
 *
 * @param element Element that will be checked
 * @param item Used to make the headers/path breadcrumb
 */
function checkType(element, item){
    var result = [];
    //Check if element is a String
    if(_.isString(element)){
        var resultString = options.handleString ? options.handleString(element, item) : handleString(element, item);
        result.push({
            item: item,
            value: resultString
        });
    }
    //Check if element is a Number
    else if(_.isNumber(element)){
        var resultNumber = options.handleNumber ? options.handleNumber(element, item) : handleNumber(element, item);
        result.push({
            item: item,
            value: resultNumber
        });
    }
    //Check if element is a Boolean
    else if(_.isBoolean(element)){
        var resultBoolean = options.handleBoolean ? options.handleBoolean(element, item) : handleBoolean(element, item);
        result.push({
            item: item,
            value: resultBoolean
        });
    }
    //Check if element is a Date
    else if(_.isDate(element)){
        var resultDate = options.handleDate ? options.handleDate(element, item) : handleDate(element, item);
        result.push({
            item: item,
            value: resultDate
        });
    }
    //Check if element is an Array
    else if(_.isArray(element)){
        var resultArray = handleArray(element, item);
        resultArray.forEach(function (resultArrayElement) {
            if(resultArrayElement.item && item){
                resultArrayElement.item = item + options.headerPathString + resultArrayElement.item;
            }
            if(!resultArrayElement.item && item){
                resultArrayElement.item = item;
            }
            result.push(resultArrayElement);
        });
    }
    //Check if element is a Object
    else if(_.isObject(element)){
        var resultObject = handleObject(element, item);
        resultObject.forEach(function (resultObjectElement) {
            if(resultObjectElement.item && item) {
                resultObjectElement.item = item + options.headerPathString + resultObjectElement.item;
            }
            if(!resultObjectElement.item && item){
                resultObjectElement.item = item;
            }
            result.push(resultObjectElement);
        });
    }
    //Finished, returning the result now
    return result;
}
/**
 * Handle all Objects
 *
 * @param {Object} obj
 * @returns {Array} result
 */
function handleObject(obj){
    var result = [];
    //Look every object props
    for(var prop in obj){
        var propData = obj[prop];
        //Check the propData type
        var resultCheckType = checkType(propData, prop);
        //Append to results
        result = result.concat(resultCheckType);
    }
    return result;
}
/**
 * Handle all Arrays, merges arrays with primitive types in a single value
 *
 * @param {Array} array
 * @returns {Array} result
 */
function handleArray(array){
    var result = [];
    array.forEach(function(element) {
        //Check the propData type
        var resultCheckType = checkType(element);

        //Append to results
        result = result.concat(resultCheckType);
    });
    //Check for results without itens, merge all itens with the first occurrence
    var firstElementWithoutItem;
    result = result.filter(function (resultElement, resultIndex) {
        //Check if there is a firstElement and if the current element dont have a item
        if(!resultElement.item && firstElementWithoutItem !== undefined){
            //Append the value to the firstElementWithoutItem.
            result[firstElementWithoutItem].value += options.arrayPathString + resultElement.value;
            //Remove the item
            return false;
        }
        //Set the firstElement if its not set
        if(!firstElementWithoutItem && !resultElement.item)
            firstElementWithoutItem = resultIndex;
        //Keep the item in the array
        return true;
    });
    //Finished, returning result now
    return result;
}
/**
 * Handle all Boolean variables, can be replaced with options.handleBoolean
 *
 * @param {Boolean} boolean
 * @returns {String} result
 */
function handleBoolean(boolean){
    var result;
    //Check for booolean options
    if(boolean){
        result = options.booleanTrueString || 'true';
    }else{
        result = options.booleanFalseString || 'false';
    }
    //Finished, returning result now
    return result;
}
/**
 * Handle all String variables, can be replaced with options.handleString
 *
 * @param {String} string
 * @returns {String} string
 */
function handleString(string){
    //Finished, returning the string now
    return string;
}
/**
 * Handle all Number variables, can be replaced with options.handleNumber
 *
 * @param {Number} number
 * @returns {Number} number
 */
function handleNumber(number){
    //Finished, returning the number now
    return number;
}
/**
 * Handle all Date variables, can be replaced with options.handleDate
 *
 * @param {Date} number
 * @returns {string} result
 */
function handleDate(date){
    //Finished, returning the number now
    return date.toLocaleString();
}
