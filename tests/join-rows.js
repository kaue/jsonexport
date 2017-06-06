/* jshint node:true */
/* jshint esversion: 6 */
/* jshint -W030 */

var chai = require('chai');
var expect = chai.expect;
var joinRows = require('../lib/core/join-rows');
var os = require('os');

describe('joinRows', () => {
  it('should throw with no params', () => {
    expect(joinRows).to.throw(TypeError);
  });

  it('should throw with bad params', () => {
    expect(joinRows.bind(null, 'rows')).to.throw(TypeError);
    expect(joinRows.bind(null, 0)).to.throw(TypeError);
    expect(joinRows.bind(null, 1)).to.throw(TypeError);
    expect(joinRows.bind(null, true)).to.throw(TypeError);
    expect(joinRows.bind(null, null)).to.throw(TypeError);
  });

  it('should handle empty array', () => {
    expect(joinRows.bind(null, [])).to.not.throw(TypeError);
    expect(joinRows.call(null, [])).to.be.a.string;
    expect(joinRows.call(null, [])).to.be.empty;
  });

  it('should handle valid array', () => {
    const mocks = ['1', '2', '3'];
    expect(joinRows.bind(null, mocks)).to.not.throw(TypeError);
    expect(joinRows.call(null, mocks)).to.be.a.string;
    expect(joinRows.call(null, mocks)).to.be.equal(`1${os.EOL}2${os.EOL}3`);
  });
});
