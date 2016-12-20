/* jshint node:true */
/* jshint esversion: 6 */
/* jshint -W030 */

var chai = require('chai');
var expect = chai.expect;
var escapeDelimiters = require('../lib/escape-delimiters')('"', "\n", "\n");
var generateHeaders = require('../lib/generate-headers')(escapeDelimiters);

var os = require('os');

describe('generateHeaders', () => {
    it('should handle empty array', () => {
      expect(generateHeaders.call(null, [])).to.be.an.array;
      expect(generateHeaders.call(null, [])).to.be.empty;
    });

    var mocks = [
      [
        {item: 'firstname', value: 'John'},
        {item: 'name', value: 'Doe'},
      ],
      [
        {item: 'name', value: 'Zorro'},
      ],
      [
        {item: 'firstname', value: 'Jean'},
        {item: 'name', value: 'Dupond'},
      ],
    ];

    it('should handle valid array without sorting', () => {
      expect(generateHeaders(mocks)).to.be.an.array;
      expect(generateHeaders(mocks)).to.contain('firstname');
      expect(generateHeaders(mocks)).to.contain('name');
    });

    it('should handle valid array with sorting', () => {
      expect(generateHeaders(mocks, true)).to.be.an.array;
      expect(generateHeaders(mocks, true)).to.be.eql(['name', 'firstname']);
    });

    var mocks2 = [
      [{item:'text "delimited" header'}],
      [{item: "row \n header"}],
    ];

    it('should escape headers content', () => {
      expect(generateHeaders(mocks2)).to.be.an.array;
      expect(generateHeaders(mocks2)).to.contain('text ""delimited"" header');
      expect(generateHeaders(mocks2)).to.contain('"row \n header"');
    });


});
