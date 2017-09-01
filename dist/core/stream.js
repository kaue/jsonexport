/* jshint node:true */
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Transform = require('stream').Transform;

var Stream = function (_Transform) {
  _inherits(Stream, _Transform);

  function Stream(parser) {
    _classCallCheck(this, Stream);

    var _this = _possibleConstructorReturn(this, (Stream.__proto__ || Object.getPrototypeOf(Stream)).call(this));

    _this._parser = parser;
    _this._options = parser._options;
    _this._headers = _this._options.headers || [];
    _this._hasHeaders = false;
    _this._lastError = null;
    return _this;
  }

  _createClass(Stream, [{
    key: '_mergeChunk',
    value: function _mergeChunk(chunk) {
      var self = this;
      self._extra = self._extra || "";
      // Memory limit    
      if (self._extra.length > chunk.toString().length * 3) return null;
      // Remove starting comma
      if (self._extra.charAt(0) == ',') self._extra = self._extra.substr(1);
      // Append extra to chunk
      chunk = self._extra + chunk.toString();
      // Clear extra memory
      if (self._extra.length > 0) self._extra = "";
      return chunk;
    }
  }, {
    key: '_wrapArray',
    value: function _wrapArray(data) {
      if (data.charAt(0) != '[') data = '[' + data;
      if (data.charAt(data.length - 1) != ']') data += ']';
      return data;
    }
  }, {
    key: '_transform',
    value: function _transform(chunk, encoding, done) {
      var self = this;
      var json = null;
      // Append extra data to chunk data
      chunk = this._mergeChunk(chunk);
      if (!chunk) return done(this._lastError);
      // Split chunk in objects
      var parts = chunk.split('}');
      while (json === null && parts.length > 0) {
        try {
          var data = self._wrapArray(parts.join('}'));
          json = JSON.parse(data);
        } catch (ex) {
          this._lastError = ex;
          var extraChunk = parts.pop();
          self._extra = extraChunk + (self._extra || "");
          if (parts.length > 0) parts[parts.length - 1] += "}";
        }
      }
      if (!json) return done();
      this._parser.parse(json, function (err, csvChunk) {
        if (err) return done(err);
        if (!self.hasHeaders) {
          self.hasHeaders = true;
          self.push(self._parser.headers);
        }
        self.push(self._options.endOfLine + csvChunk);
        done();
      }, true);
    }
  }]);

  return Stream;
}(Transform);

module.exports = Stream;