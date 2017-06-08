/* jshint node:true */
'use strict';

/**
 * Module dependencies.
 */
var os = require('os');
var Transform = require('stream').Transform;
var joinRows = require('../core/join-rows');

const helper = require('../core/helper');

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
    if (helper.isArray(json)) return done(null, this._parseArray(json, stream));
    else if (helper.isObject(json)) return done(null, this._parseObject(json));
    return done(new Error('Unable to parse the JSON object, its not an Array or Object.'));
  }

  get headers() {
    let headers = this._headers;
    if (this._options.rename && this._options.rename.length > 0)
      headers = headers.map((header) => this._options.rename[this._options.headers.indexOf(header)] || header);
    return headers.join(this._options.rowDelimiter);
  }

  _parseArray(json, stream) {
    let self = this;
    this._headers = this._headers || [];
    let fileRows = [];
    let outputFile;
    let fillRows;

    let getHeaderIndex = function(header) {
      var index = self._headers.indexOf(header);
      if (index === -1) {
        self._headers.push(header);
        index = self._headers.indexOf(header);
      }
      return index;
    };

    //Generate the csv headers based on prop usage over the elements
    //var headers = generateHeaders(parseResult, options.orderHeaders);
    //Generate the csv output
    fillRows = function(result) {
      //Initialize the array with empty strings to handle 'unpopular' headers
      let rows = [Array(self._headers.length).join(".").split(".")];
      for (let element of result) {
        let elementHeaderIndex = getHeaderIndex(element.item);
        let placed = false;
        for (let row of rows) {
          if (!placed && row[elementHeaderIndex] === '' || row[elementHeaderIndex] === undefined) {
            row[elementHeaderIndex] = self._escape(element.value);
            placed = true;
            break;
          }
        }
        if (!placed) {
          let newRow = Array(self._headers.length).join(".").split(".");
          newRow[elementHeaderIndex] = self._escape(element.value);
          rows.push(newRow);
        }
      }
      let lastRow = null;
      for (let row of rows) {
        let missing = self._headers.length - row.length;
        if (missing > 0) row = row.concat(Array(missing).join(".").split("."));
        if (lastRow && self._options.fillGaps) row = row.map((col, index) => col === '' || col === undefined ? lastRow[index] : col);
        fileRows.push(row.join(self._options.rowDelimiter));
        lastRow = row;
      }
    };
    for (let item of json) {
      //Call checkType to list all items inside this object
      //Items are returned as a object {item: 'Prop Value, Item Name',

      //                                value: 'Prop Data Value'}
      let itemResult = self._checkType(item, self._options.mainPathItem);
      fillRows(itemResult);
    }

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
    if (helper.isString(element)) {
      result = [{
        item: item,
        value: this._options.handleString(element, item),
      }];
    }
    //Check if element is a Number
    else if (helper.isNumber(element)) {
      result = [{
        item: item,
        value: this._options.handleNumber(element, item),
      }];
    }
    //Check if element is a Boolean
    else if (helper.isBoolean(element)) {
      result = [{
        item: item,
        value: this._options.handleBoolean(element, item),
      }];
    }
    //Check if element is a Date
    else if (helper.isDate(element)) {
      result = [{
        item: item,
        value: this._options.handleDate(element, item),
      }];
    }
    //Check if element is an Array
    else if (helper.isArray(element)) {
      var resultArray = this._handleArray(element, item);
      result = this._setHeaders(resultArray, item);
    }
    //Check if element is a Object
    else if (helper.isObject(element)) {
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
    var firstElementWithoutItem;
    for (let element of array) {
      //Check the propData type
      var resultCheckType = self._checkType(element);
      //Check for results without itens, merge all itens with the first occurrence
      if(resultCheckType.length === 0) continue;
      var firstResult = resultCheckType[0];
      if (!firstResult.item && firstElementWithoutItem !== undefined) {
        firstElementWithoutItem.value += self._options.arrayPathString + firstResult.value;
        continue;
      } else if (resultCheckType.length > 0 && !firstResult.item && firstElementWithoutItem === undefined) {
        firstElementWithoutItem = firstResult;
      }
      //Append to results
      result = result.concat(resultCheckType);
    }
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
      headers: [], //                  Array
      rename: [], //                   Array
      headerPathString: '.', //       String
      rowDelimiter: ',', //           String
      textDelimiter: '"', //          String
      arrayPathString: ';', //        String
      undefinedString: '', //         String
      endOfLine: os.EOL || '\n', //   String
      mainPathItem: null, //          String
      booleanTrueString: null, //     String
      booleanFalseString: null, //    String
      includeHeaders: true, //        Boolean
      fillGaps: false, //             Boolean
      verticalOutput: true, //        Boolean
      //Handlers
      handleString: this._handleString, //          Function
      handleNumber: this._handleNumber, //          Function
      handleBoolean: this._handleBoolean, //        Function
      handleDate: this._handleDate, //              Function
    };

    return Object.assign({}, defaultOptions, userOptions);
  }
}

module.exports = Parser;
