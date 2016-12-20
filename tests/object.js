/* jshint node:true */
/* jshint esversion: 6 */
/* jshint -W030 */

var chai = require('chai');
var expect = chai.expect;
var jsonexport = require('../lib/index');

describe('Object', () => {
    it('simple', () => {
        jsonexport({
            lang: 'Node.js',
            module: 'jsonexport'
        }, {}, (err, csv) => {
            expect(csv).to.equal('lang,Node.js\nmodule,jsonexport');
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
            size: [10,20],
            escaped: 'I am a "quoted" field'
        }, {}, (err, csv) => {
            expect(csv).to.equal('cars,12\nroads,5\ntraffic,slow\nspeed.max,123\nspeed.avg,20\nspeed.min,5\nsize,10;20\nescaped,I am a ""quoted"" field');
        });
    });
});
