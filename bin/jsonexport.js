#! /usr/bin/env node

var jsonexport = require('../lib/index.js');

var stdin = process.stdin,
    inputChunks = [];

stdin.setEncoding('utf8');

stdin.on('data', function (chunk) {
    inputChunks.push(chunk);
});

stdin.on('end', function () {
    var input = inputChunks.join(''),
        parsedData = JSON.parse(input);

    jsonexport(parsedData, function (err, csv) {
        if (err) {
            console.error(err);
            process.exit(1);
        }

        console.log(csv);
    });
});
