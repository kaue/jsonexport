/* jshint node:true */
'use strict';

const Transform = require('stream').Transform;

class Stream extends Transform {
  constructor(parser) {
    super()
    this._parser = parser;
    this._options = parser._options;
    this._headers = this._options.headers || [];
    this._hasHeaders = false;
  }
}

Stream.prototype._transform = function(chunk, encoding, done) {
  let self = this;
  let json = null;
  // Append extra data to chunk data
  self._extra = self._extra || "";
  if (self._extra > chunk.toString().length * 3) return done(new Error("Invalid JSON"));
  if (self._extra.charAt(0) == ',') self._extra = self._extra.substr(1);
  chunk = self._extra + chunk.toString();
  if (self._extra.length > 0) self._extra = "";
  // Split chunk in objects
  let parts = chunk.split('}');
  while (json == null && parts.length > 0) {
    try {
      let data = parts.join('}');
      if (data.charAt(0) != '[') data = '[' + data;
      if (data.charAt(data.length - 1) != ']') data += ']';
      json = JSON.parse(data);
    } catch (ex) {
      let extraChunk = parts.pop();
      self._extra = extraChunk + (self._extra || "");
      if (parts.length > 0)
        parts[parts.length - 1] += "}";
    }
  }
  if (!json) return done();
  this._parser.parse(json, (err, csvChunk) => {
    if (err) return done(err);
    if(!self.hasHeaders) {
      self.hasHeaders = true;
      self.push(self._parser.headers + self._options.endOfLine);
    }
    self.push(csvChunk + self._options.endOfLine);
    done();
  }, true);
}

module.exports = Stream;
