/* jshint node:true */
/* jshint esversion: 6 */
/* jshint -W030 */

var chai = require('chai');
var expect = chai.expect;
var jsonexport = require('../lib/index');
var os = require('os');

describe('Array', () => {
  it('simple', () => {
    jsonexport([{
      name: 'Bob',
      lastname: 'Smith'
    }, {
      name: 'James',
      lastname: 'David',
      escaped: 'I am a "quoted" field'
    }], {}, (err, csv) => {
      expect(csv).to.equal(`name,lastname,escaped${os.EOL}Bob,Smith${os.EOL}James,David,"I am a ""quoted"" field"`);
    });
  });
  it('complex', () => {
    jsonexport([{
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
    }], {}, (err, csv) => {
      expect(csv).to.equal(`id,name,lastname,family.name,family.type${os.EOL}1,Bob,Smith,Peter,Father${os.EOL}2,James,David,Julie,Mother`);
    });
  });
  it('with nested arrays', () => {
    jsonexport([{
      a: {
        b: true,
        c: [{
            d: 1
          },
          {
            d: 2
          },
          {
            d: 3
          },
          {
            d: 4
          }
        ],
        e: [{
            f: 1
          },
          {
            f: 2
          }
        ]
      }
    }], {}, (err, csv) => {
      expect(csv).to.equal(`a.b,a.c.d,a.e.f${os.EOL}true,1,1${os.EOL},2,2${os.EOL},3,${os.EOL},4,`);
    });
  });
  it('with nested arrays & empty strings', () => {
    jsonexport([
      {
        "a": "",
        "b": "b",
        "c": [
          {
            "a": "a1",
            "b": "b1"
          },
          {
            "a": "a2",
            "b": "b2"
          },
          {
            "a": "",
            "b": "b3"
          },
          {
            "a": "a4",
            "b": "b4"
          }
        ]
      }
    ], {}, (err, csv) => {
      expect(csv).to.equal(`a,b,c.a,c.b${os.EOL},b,a1,b1${os.EOL},,a2,b2${os.EOL},,,b3${os.EOL},,a4,b4`);
    });
  });
});
