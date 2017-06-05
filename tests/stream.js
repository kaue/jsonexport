/* jshint node:true */
/* jshint esversion: 6 */
/* jshint -W030 */

var chai = require('chai');
var expect = chai.expect;
var jsonexport = require('../lib/index');
var os = require('os');
var stream = require('stream');

describe('Array', () => {
  it('simple', () => {
    var read = new stream.Readable();
    var write = new stream.Writable();

    write._write = function(chunk, enc, next) {
      let csv = chunk.toString();
      expect(csv).to.equal(`name,lastname,escaped${os.EOL}Bob,Smith${os.EOL}James,David,I am a ""quoted"" field`);
      next();
    };

    read.pipe(jsonexport()).pipe(write);

    read.push(JSON.stringify([{
      name: 'Bob',
      lastname: 'Smith'
    }, {
      name: 'James',
      lastname: 'David',
      escaped: 'I am a "quoted" field'
    }]))
    read.push(null);
  });
  it('simple with options', () => {
    var read = new stream.Readable();
    var write = new stream.Writable();

    write._write = function(chunk, enc, next) {
      let csv = chunk.toString();
      expect(csv).to.equal(`name|lastname|escaped${os.EOL}Bob|Smith${os.EOL}James|David|I am a ""quoted"" field`);
      next();
    };

    read.pipe(jsonexport({
      rowDelimiter: '|'
    })).pipe(write);

    read.push(JSON.stringify([{
      name: 'Bob',
      lastname: 'Smith'
    }, {
      name: 'James',
      lastname: 'David',
      escaped: 'I am a "quoted" field'
    }]))
    read.push(null);
  });
  it('complex', () => {
    var read = new stream.Readable();
    var write = new stream.Writable();

    write._write = function(chunk, enc, next) {
      let csv = chunk.toString();
      expect(csv).to.equal(`id,name,lastname,family.name,family.type${os.EOL}1,Bob,Smith,Peter,Father${os.EOL}2,James,David,Julie,Mother`);
      next();
    };

    read.pipe(jsonexport()).pipe(write);

    read.push(JSON.stringify([{
      id: 1,
      name: 'Bob',
      lastname: 'Smith',
      family: {
        name: 'Peter',
        type: 'Father'
      }
    }, {
      id: 2,
      name: 'James',
      lastname: 'David',
      family: {
        name: 'Julie',
        type: 'Mother'
      }
    }]))
    read.push(null);
  });
});
