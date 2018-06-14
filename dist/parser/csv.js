/* jshint node:true */
'use strict';

/**
 * Module dependencies.
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EOL = require('../core/eol');
var joinRows = require('../core/join-rows');
var Handler = require('./handler');
var helper = require('../core/helper');

var Parser = function () {
  function Parser(options) {
    _classCallCheck(this, Parser);

    this._options = this._parseOptions(options) || {};
    this._handler = new Handler(this._options);
    this._headers = this._options.headers || [];
    this._escape = require('../core/escape-delimiters')(this._options.textDelimiter, this._options.rowDelimiter);
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


  _createClass(Parser, [{
    key: 'parse',
    value: function parse(json, done, stream) {
      if (helper.isArray(json)) return done(null, this._parseArray(json, stream));else if (helper.isObject(json)) return done(null, this._parseObject(json));
      return done(new Error('Unable to parse the JSON object, its not an Array or Object.'));
    }
  }, {
    key: '_checkRows',
    value: function _checkRows(rows) {
      var lastRow = null;
      var finalRows = [];
      var fillGaps = function fillGaps(col, index) {
        return col === '' || col === undefined ? lastRow[index] : col;
      };
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = rows[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var row = _step.value;

          var missing = this._headers.length - row.length;
          if (missing > 0) row = row.concat(Array(missing).join(".").split("."));
          if (lastRow && this._options.fillGaps) row = row.map(fillGaps);
          finalRows.push(row.join(this._options.rowDelimiter));
          lastRow = row;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return finalRows;
    }
  }, {
    key: '_parseArray',
    value: function _parseArray(json, stream) {
      var self = this;
      this._headers = this._headers || [];
      var fileRows = [];
      var outputFile = void 0;
      var fillRows = void 0;

      var getHeaderIndex = function getHeaderIndex(header) {
        var index = self._headers.indexOf(header);
        if (index === -1) {
          self._headers.push(header);
          index = self._headers.indexOf(header);
        }
        return index;
      };

      //Generate the csv output
      fillRows = function fillRows(result) {
        //Initialize the array with empty strings to handle 'unpopular' headers
        var resultRows = [Array(self._headers.length).join(".").split(".")];
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = result[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var element = _step2.value;

            var elementHeaderIndex = getHeaderIndex(element.item);
            var placed = false;
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
              for (var _iterator3 = resultRows[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var row = _step3.value;

                if (!placed && row[elementHeaderIndex] === '' || row[elementHeaderIndex] === undefined) {
                  row[elementHeaderIndex] = self._escape(element.value);
                  placed = true;
                  break;
                }
              }
            } catch (err) {
              _didIteratorError3 = true;
              _iteratorError3 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                  _iterator3.return();
                }
              } finally {
                if (_didIteratorError3) {
                  throw _iteratorError3;
                }
              }
            }

            if (!placed) {
              var newRow = Array(self._headers.length).join(".").split(".");
              newRow[elementHeaderIndex] = self._escape(element.value);
              resultRows.push(newRow);
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        fileRows = fileRows.concat(self._checkRows(resultRows));
      };
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = json[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var item = _step4.value;

          //Call checkType to list all items inside this object
          //Items are returned as a object {item: 'Prop Value, Item Name', value: 'Prop Data Value'}
          var itemResult = self._handler.check(item, self._options.mainPathItem, item, json);
          fillRows(itemResult);
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      if (!stream && self._options.includeHeaders) {
        //Add the headers to the first line
        fileRows.unshift(this.headers);
      }

      return joinRows(fileRows, self._options.endOfLine);
    }
  }, {
    key: '_parseObject',
    value: function _parseObject(json) {
      var self = this;
      var fileRows = [];
      var parseResult = [];
      var outputFile = void 0;
      var fillRows = void 0;
      var horizontalRows = [[], []];

      fillRows = function fillRows(result) {
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
        if (this._options.mainPathItem) prefix = this._options.mainPathItem + this._options.headerPathString;
        parseResult = this._handler.check(json[prop], prefix + prop, prop, json);

        parseResult.forEach(fillRows);
      }
      if (!this._options.verticalOutput) {
        fileRows.push(horizontalRows[0].join(this._options.rowDelimiter));
        fileRows.push(horizontalRows[1].join(this._options.rowDelimiter));
      }
      return joinRows(fileRows, this._options.endOfLine);
    }

    /**
     * Replaces the default options with the custom user options
     *
     * @param {Options} userOptions
     */

  }, {
    key: '_parseOptions',
    value: function _parseOptions(userOptions) {
      var defaultOptions = {
        headers: [], //              Array
        rename: [], //               Array
        headerPathString: '.', //    String
        rowDelimiter: ',', //        String
        textDelimiter: '"', //       String
        arrayPathString: ';', //     String
        undefinedString: '', //      String
        endOfLine: EOL || '\n', //   String
        mainPathItem: null, //       String
        booleanTrueString: null, //  String
        booleanFalseString: null, // String
        includeHeaders: true, //     Boolean
        fillGaps: false, //          Boolean
        verticalOutput: true, //     Boolean
        //Handlers
        handleString: undefined, //  Function
        handleNumber: undefined, //  Function
        handleBoolean: undefined, // Function
        handleDate: undefined //    Function
      };
      return Object.assign({}, defaultOptions, userOptions);
    }
  }, {
    key: 'headers',
    get: function get() {
      var _this = this;

      var headers = this._headers;
      if (this._options.rename && this._options.rename.length > 0) headers = headers.map(function (header) {
        return _this._options.rename[_this._options.headers.indexOf(header)] || header;
      });
      return headers.join(this._options.rowDelimiter);
    }
  }]);

  return Parser;
}();

module.exports = Parser;