#! /usr/bin/env node

const jsonexport = require('../lib/index.js');
const fs = require('fs');

const stdin = process.stdin;
const stdout = process.stdout;

var filename = process.argv[2];

if (filename)
  return fs.createReadStream(filename)
    .pipe(jsonexport())
    .pipe(stdout);

stdin.setEncoding('utf8');
stdin
  .pipe(jsonexport())
  .pipe(stdout);
