#! /usr/bin/env node
const fs = require('fs');
const path = require('path');

function overwriteEol(){
  const fileString=
  `/* jshint node:true */
  'use strict';

  module.exports = "\\n";
  `
  const outFilePath = path.join(__dirname,"../dist/core/eol.js")
  fs.writeFileSync(outFilePath, fileString)
}

function overwriteStream(){
  const fileString=
  `/* jshint node:true */
  'use strict';

  var Stream = function (_Transform) {
    throw new Error("jsonexport called without third argument as a callback and is required")
  }

  module.exports = Stream;
  `
  const outFilePath = path.join(__dirname,"../dist/core/stream.js")
  fs.writeFileSync(outFilePath, fileString)
}

overwriteEol()
overwriteStream()