/* jshint node:true */
/* jshint esversion: 6 */
/* jshint -W030 */

var os = require('os');
var chai = require('chai');
var expect = chai.expect;

var escapeDelimiters = require('../lib/escape-delimiters')('"', '\n', os.EOL);

describe('escapeDelimiters', () => {

    const mocks = {
      simpleText: 'I am a "quoted" field',
      simpleRow: 'I am a \n multi line field',
      complexField: 'I am a \n multi line field containing "textDelimiters"'
    };

    it('should escape textDelimiters', () => {
      expect(escapeDelimiters(mocks.simpleText)).to.be.a.string;
      expect(escapeDelimiters(mocks.simpleText)).to.be.equal('I am a ""quoted"" field');
    });

    it('should escape rowDelimiters', () => {
      expect(escapeDelimiters(mocks.simpleRow)).to.be.a.string;
      expect(escapeDelimiters(mocks.simpleRow)).to.be.equal('"I am a \n multi line field"');
    });

    it('should escape both textDelimiters and rowDelimiters', () => {
      expect(escapeDelimiters(mocks.complexField)).to.be.a.string;
      expect(escapeDelimiters(mocks.complexField)).to.be.equal('"I am a \n multi line field containing ""textDelimiters"""');
    });
});
