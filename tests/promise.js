/* jshint evil: true */
/* jshint ignore: start */

var chai = require('chai');
var expect = chai.expect;
var jsonexport = require('../lib/index');
var os = require('os');

describe('Promise', () => {
  it('resolve', async () => {
    const csv = await jsonexport([{
      name: 'Bob',
      lastname: 'Smith'
    }, {
      name: 'James',
      lastname: 'David',
      escaped: 'I am a "quoted" field'
    }]);
    expect(csv).to.equal(`name,lastname,escaped${os.EOL}Bob,Smith${os.EOL}James,David,"I am a ""quoted"" field"`);
  });
  it('catch', (done) => {
    jsonexport(1).catch(err => {
      expect(err).to.be.an('error', 'promise .catch() should return errors');
      done()
    });
  });
  it('with options', async () => {
    const csv = await jsonexport([{
      name: 'Bob',
      lastname: 'Smith'
    }, {
      name: 'James',
      lastname: 'David',
      escaped: 'I am a "quoted" field'
    }], {
      rowDelimiter: ';',
    })
    expect(csv).to.equal(`name;lastname;escaped${os.EOL}Bob;Smith${os.EOL}James;David;"I am a ""quoted"" field"`);
  });
});
