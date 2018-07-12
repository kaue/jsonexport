/* jshint node:true */
/* jshint esversion: 6 */
/* jshint -W030 */

var os = require('os');
var chai = require('chai');
var expect = chai.expect;

var escapeDelimiters = require('../lib/core/escape-delimiters')('"', '\n', os.EOL);

describe('escapeDelimiters', () => {
  const mocks = {
    simpleText: 'I am a "quoted" field',
    simpleRow: 'I am a \n multi line field',
    complexField: 'I am a \n multi line field containing "textDelimiters"',
    alreadyEscaped: '"I contain "double quotes" everywhere !"',
    forceEscape: 42
  };

  it('should escape textDelimiters', () => {
    expect(escapeDelimiters(mocks.simpleText)).to.be.a.string;
    expect(escapeDelimiters(mocks.simpleText)).to.be.equal('"I am a ""quoted"" field"');
  });

  it('should escape all textDelimiters', () => {
    expect(escapeDelimiters(mocks.alreadyEscaped)).to.be.a.string;
    expect(escapeDelimiters(mocks.alreadyEscaped)).to.be.equal('"""I contain ""double quotes"" everywhere !"""');
  });

  it('should escape rowDelimiters', () => {
    expect(escapeDelimiters(mocks.simpleRow)).to.be.a.string;
    expect(escapeDelimiters(mocks.simpleRow)).to.be.equal('"I am a \n multi line field"');
  });

  it('should escape both textDelimiters and rowDelimiters', () => {
    expect(escapeDelimiters(mocks.complexField)).to.be.a.string;
    expect(escapeDelimiters(mocks.complexField)).to.be.equal('"I am a \n multi line field containing ""textDelimiters"""');
  });

  it('should escape if forceTextDelimiter flag is true', () => {
    var escapeDelimiters = require('../lib/core/escape-delimiters')('"', '\n', true);

    expect(escapeDelimiters(mocks.forceEscape)).to.be.a.string;
    expect(escapeDelimiters(mocks.forceEscape)).to.be.equal('"42"');
  });
});
