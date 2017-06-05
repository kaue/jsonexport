/* jshint node:true */
'use strict';

/**
 * Module dependencies.
 */
var os = require('os');
var _ = require('underscore');
var Transform = require('stream').Transform;
var joinRows = require('../core/join-rows');


class Parser {
  constructor(options) {
    this._options = this._parseOptions(options) || {};
    this._headers = this._options.headers || [];
    this._escape = require('../core/escape-delimiters')(
      this._options.textDelimiter,
      this._options.rowDelimiter
    );
  }

  /**
   * Generates a CSV file with optional headers based on the passed JSON,
   * with can be an Object or Array.
   *
   * @param {Object|Array} json
   * @param {Function} done(err,csv) - Callback function
   *      if error, returning error in call back.
   *      if csv is created successfully, returning csv output to callback.
   */
  parse(json, done, stream) {
    if (_.isArray(json)) return done(null, this._parseArray(json, stream));
    else if (_.isObject(json)) return done(null, this._parseObject(json));
    return callback(new Error('Unable to parse the JSON object, its not an Array or Object.'));
  }

  get headers() {
    return this._headers.join(this._options.rowDelimiter);
  }
  _parseArray(json, stream) {
    let self = this;
    this._headers = this._headers || [];
    let fileRows = [];
    let parseResult = [];
    let outputFile;
    let fillRows;
    json.forEach(function(item) {
      //Call checkType to list all items inside this object
      //Items are returned as a object {item: 'Prop Value, Item Name',
      //                                value: 'Prop Data Value'}
      var itemResult = self._checkType(item, self._options.mainPathItem);
      parseResult.push(itemResult);
    });
    let getHeaderIndex = function(header) {
      let index = self._headers.indexOf(header);
      if (index === -1) {
        self._headers.push(header);
        index = self._headers.indexOf(header);
      }
      return index;
    }

    //Generate the csv headers based on prop usage over the elements
    //var headers = generateHeaders(parseResult, options.orderHeaders);
    //Generate the csv output
    fillRows = function(result) {
      //Initialize the array with empty strings to handle 'unpopular' headers
      var resultRows = [Array(self._headers.length).join(".").split(".")];

      result.forEach(function(element) {
        var placed = false;
        resultRows.forEach(function(row) {
          var elementHeaderIndex = getHeaderIndex(element.item);
          if (!placed && row[elementHeaderIndex] === '' || row[elementHeaderIndex] === undefined) {
            row[getHeaderIndex(element.item)] = self._escape(element.value);
            placed = true;
          }
        });

        if (!placed) {
          var newRow = Array(self._headers.length).join(".").split(".");
          newRow[getHeaderIndex(element.item)] = self._escape(element.value);
          resultRows.push(newRow);
        }
      });
      resultRows.forEach(function(row) {
        fileRows.push(row.join(self._options.rowDelimiter));
      });
    };

    parseResult.forEach(fillRows);

    if (!stream && self._options.includeHeaders) {
      //Add the headers to the first line
      fileRows.unshift(this.headers);
    }

    return joinRows(fileRows, self._options.endOfLine);
  }

  _parseObject(json) {
    let self = this;
    let fileRows = [];
    let parseResult = [];
    let outputFile;
    let fillRows;
    let horizontalRows = [
      [],
      []
    ];

    fillRows = function(result) {
      var value = result.value ? result.value.toString() : self._options.undefinedString;
      value = self._escape(value);

      //Type header;value
      if (self._options.verticalOutput) {
        var row = [result.item, value];
        fileRows.push(row.join(self._options.rowDelimiter));
      } else {
        horizontalRows[0].push(result.item);
        horizontalRows[1].push(value);
      }
    };
    for (var prop in json) {
      var prefix = "";
      if (this._options.mainPathItem)
        prefix = this._options.mainPathItem + this._options.headerPathString;
      parseResult = this._checkType(json[prop], prefix + prop);

      parseResult.forEach(fillRows);
    }
    if (!this._options.verticalOutput) {
      fileRows.push(horizontalRows[0].join(this._options.rowDelimiter));
      fileRows.push(horizontalRows[1].join(this._options.rowDelimiter));
    }
    return joinRows(fileRows, this._options.endOfLine);
  }

  _setHeaders(result, item) {
    let self = this;
    if (!item) return result;
    return result.map(function(element) {
      element.item = element.item ? item + self._options.headerPathString + element.item : item;
      return element;
    });
  }

  /**
   * Check the element type of the element call the correct handle function
   *
   * @param element Element that will be checked
   * @param item Used to make the headers/path breadcrumb
   */
  _checkType(element, item) {
    let result;
    //Check if element is a String
    if (_.isString(element)) {
      result = [{
        item: item,
        value: this._options.handleString(element, item),
      }];
    }
    //Check if element is a Number
    else if (_.isNumber(element)) {
      result = [{
        item: item,
        value: this._options.handleNumber(element, item),
      }];
    }
    //Check if element is a Boolean
    else if (_.isBoolean(element)) {
      result = [{
        item: item,
        value: this._options.handleBoolean(element, item),
      }];
    }
    //Check if element is a Date
    else if (_.isDate(element)) {
      result = [{
        item: item,
        value: this._options.handleDate(element, item),
      }];
    }
    //Check if element is an Array
    else if (_.isArray(element)) {
      var resultArray = this._handleArray(element, item);
      result = this._setHeaders(resultArray, item);
    }
    //Check if element is a Object
    else if (_.isObject(element)) {
      var resultObject = this._handleObject(element, item);
      result = this._setHeaders(resultObject, item);
    } else {
      result = [{
        item: item,
        value: '',
      }];
    }
    return result;
  }


  /**
   * Handle all Objects
   *
   * @param {Object} obj
   * @returns {Array} result
   */
  _handleObject(obj) {
    var result = [];
    //Look every object props
    for (var prop in obj) {
      var propData = obj[prop];
      //Check the propData type
      var resultCheckType = this._checkType(propData, prop);
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
  _handleArray(array) {
    let self = this;
    let result = [];
    array.forEach(function(element) {
      //Check the propData type
      var resultCheckType = self._checkType(element);

      //Append to results
      result = result.concat(resultCheckType);
    });
    //Check for results without itens, merge all itens with the first occurrence
    var firstElementWithoutItem;
    result = result.filter(function(resultElement, resultIndex) {
      //Check if there is a firstElement and if the current element dont have a item
      if (!resultElement.item && firstElementWithoutItem !== undefined) {
        //Append the value to the firstElementWithoutItem.
        result[firstElementWithoutItem].value += self._options.arrayPathString + resultElement.value;
        //Remove the item
        return false;
      }
      //Set the firstElement if its not set
      if (!firstElementWithoutItem && !resultElement.item)
        firstElementWithoutItem = resultIndex;
      //Keep the item in the array
      return true;
    });
    return result;
  }
  /**
   * Handle all Boolean variables, can be replaced with options.handleBoolean
   *
   * @param {Boolean} boolean
   * @returns {String} result
   */
  _handleBoolean(boolean) {
    var result;
    //Check for booolean options
    if (boolean) {
      result = this.booleanTrueString || 'true';
    } else {
      result = this.booleanFalseString || 'false';
    }
    return result;
  }
  /**
   * Handle all String variables, can be replaced with options.handleString
   *
   * @param {String} string
   * @returns {String} string
   */
  _handleString(string) {
    return string;
  }
  /**
   * Handle all Number variables, can be replaced with options.handleNumber
   *
   * @param {Number} number
   * @returns {Number} number
   */
  _handleNumber(number) {
    return number;
  }
  /**
   * Handle all Date variables, can be replaced with options.handleDate
   *
   * @param {Date} number
   * @returns {string} result
   */
  _handleDate(date) {
    return date.toLocaleDateString();
  }

  /**
   * Replaces the default options with the custom user options
   *
   * @param {Options} userOptions
   */
  _parseOptions(userOptions) {
    /**
     * Default options
     */
    let defaultOptions = {
      headerPathString: '.', //       String
      rowDelimiter: ',', //           String
      textDelimiter: '"', //           String
      arrayPathString: ';', //        String
      undefinedString: '', //         String
      endOfLine: os.EOL || '\n', //   String
      mainPathItem: null, //          String
      booleanTrueString: null, //     String
      booleanFalseString: null, //    String
      includeHeaders: true, //        Boolean
      orderHeaders: false, //          Boolean
      verticalOutput: true, //        Boolean
      //Handlers
      handleString: this._handleString, //          Function
      handleNumber: this._handleNumber, //          Function
      handleBoolean: this._handleBoolean, //         Function
      handleDate: this._handleDate, //            Function
    };
    return _.extend(defaultOptions, userOptions);
  }
}

module.exports = Parser;
