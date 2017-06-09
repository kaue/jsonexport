#! /usr/bin/env node
const jsonexport = require('../lib/index.js');
const fs = require('fs');

const stdin = process.stdin;
const stdout = process.stdout;
const inputFile = process.argv[2];
const outputFile = process.argv[3];

if (inputFile)
  return fs.createReadStream(inputFile)
    .pipe(jsonexport())
    .pipe(outputFile ? fs.createWriteStream(outputFile) : stdout);

stdin.setEncoding('utf8');
stdin
  .pipe(jsonexport())
  .pipe(stdout);
