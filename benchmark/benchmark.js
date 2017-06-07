var fs = require('fs');
var util = require('util');
var Benchmark = require('benchmark');
var suite = new Benchmark.Suite;
var json2csv = require('json2csv');
var json2csvstream = new require('json2csv-stream')();
var jsonexport = require('../lib/index');
// start benchmarking
suite

  .add('jsonexport', {
    'defer': true,
    'fn': function(deferred) {
      // var data = require('./data.json');
      fs.readFile('data.json', function(err, data) {
        data = JSON.parse(data.toString());
        if (err) console.log(err);
        jsonexport(data, function(err, csv) {
          if (err) console.log(err);
          fs.writeFile('out-no-streams.csv', csv, function(err) {
            if (err) console.log(err);
            deferred.resolve();
          })
        })
      })
    }
  })
  .add('jsonexport-stream', {
    'defer': true,
    'fn': function(deferred) {
      var reader = fs.createReadStream('data.json');
      var writer = fs.createWriteStream('out.csv');

      reader.on('error', function(err) {
        console.log(err);
      });

      writer.on('error', function(err) {
        console.log(err);
      });

      writer.on('finish', function() {
        deferred.resolve();
      });

      reader.pipe(jsonexport()).pipe(writer);
    }
  })
  .add('json2csv', {
    'defer': true,
    'fn': function(deferred) {
      // var data = require('./data.json');
      fs.readFile('data.json', function(err, data) {
        data = JSON.parse(data.toString());
        if (err) console.log(err);
        json2csv({
          data: data,
          fields: ['car', 'price', 'color']
        }, function(err, csv) {
          if (err) console.log(err);
          fs.writeFile('out-no-streams.csv', csv, function(err) {
            if (err) console.log(err);
            deferred.resolve();
          })
        })
      })
    }
  })
  .add('json2csv-stream', {
    'defer': true,
    'fn': function(deferred) {
      var reader = fs.createReadStream('data.json');
      var writer = fs.createWriteStream('out.csv');

      reader.on('error', function(err) {
        console.log(err);
      });

      writer.on('error', function(err) {
        console.log(err);
      });
      json2csvstream.on('end', function() {
        // Wait until reader is over and then close reader and finish deferred test
        writer.end();
        deferred.resolve();
      });
  


      reader.pipe(json2csvstream).pipe(writer, {
        end: false
      });
    }
  })
  // add listeners
  .on('cycle', function(event) {
    var details = event.target;
    console.log('Executed benchmark against node module: "%s"', details.name);
    console.log('Count (%d), Cycles (%d), Elapsed (%d sec), Hz (%d ops/sec)\n', details.count, details.cycles, details.times.elapsed, details.hz);
  })
  .on('complete', function() {
    console.log('Module: "' + this.filter('fastest').pluck('name') + '" wins.');
  })
  // run async
  .run();
