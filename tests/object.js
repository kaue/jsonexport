/* jshint node:true */
/* jshint esversion: 6 */
/* jshint -W030 */

var chai = require('chai');
var expect = chai.expect;
var jsonexport = require('../lib/index');
var os = require('os');

describe('Object', () => {
  it('simple', () => {
    jsonexport({
      lang: 'Node.js',
      module: 'jsonexport'
    }, {}, (err, csv) => {
      expect(csv).to.equal(`lang,Node.js${os.EOL}module,jsonexport`);
    });
  });
  it('complex', () => {
    jsonexport({
      cars: 12,
      roads: 5,
      traffic: 'slow',
      speed: {
        max: 123,
        avg: 20,
        min: 5
      },
      size: [10, 20],
      escaped: 'I am a "quoted" field'
    }, {}, (err, csv) => {
      expect(csv).to.equal(`cars,12${os.EOL}roads,5${os.EOL}traffic,slow${os.EOL}speed.max,123${os.EOL}speed.avg,20${os.EOL}speed.min,5${os.EOL}size,10;20${os.EOL}escaped,"I am a ""quoted"" field"`);
    });
  });
});
