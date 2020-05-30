var chai = require('chai');
var expect = chai.expect;
var jsonexport = require('../lib/index');
var os = require('os');

describe('Options', () => {
  it('rename', () => {
    jsonexport([{
      name: 'Bob',
      lastname: 'Smith',
      address: {
        number: 1
      }
    }, {
      name: 'James',
      lastname: 'David',
      test: true
    }], {
      headers: ['lastname', 'name', 'address.number'],
      rename: ['Last Name', 'Name', 'Address Number']
    }, (err, csv) => {
      expect(csv).to.equal(`Last Name,Name,Address Number,test${os.EOL}Smith,Bob,1${os.EOL}David,James,,true`);
    });
  });
  it('fillGaps', () => {
    jsonexport([{
      a: {
        b: true,
        c: [{
            d: true
          },
          {
            d: false
          }
        ]
      }
    }], {
      fillGaps: true
    }, (err, csv) => {
      expect(csv).to.equal(`a.b,a.c.d${os.EOL}true,true${os.EOL}true,false`);
    });
  });
  it('fillTopRow', () => {
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
    }], {
      fillTopRow: true,
    }, (err, csv) => {
      expect(csv).to.equal(`a.b,a.c.d,a.e.f${os.EOL}true,1,1${os.EOL},2,2${os.EOL},3,${os.EOL},4,`);
    });
  });
  it('mapHeaders', () => {
    jsonexport([{
      a: true,
      b: false
    }], {
      mapHeaders: h => `${h}|||`
    }, (err, csv) => {
      expect(csv).to.have.string('a|||');
    });
  });
  it('headerPathString', () => {
    jsonexport({
      a: {
        b: true
      }
    }, {
      headerPathString: '|'
    }, (err, csv) => {
      expect(csv).to.have.string('a|b');
    });
  });
  it('rowDelimiter', () => {
    jsonexport({
      a: true,
      b: true
    }, {
      rowDelimiter: '|'
    }, (err, csv) => {
      expect(csv).to.have.string('a|true');
    });
  });
  it('defaults', () => {
    jsonexport({
      a: true,
      b: true
    }, (err, csv) => {
      expect(csv).to.have.string('a,true');
      expect(csv).to.have.string('b,true');
    });
  });
  it('textDelimiter with linebreak', () => {
    jsonexport({
      a: '\n',
      b: true
    }, {
      textDelimiter: '|'
    }, (err, csv) => {
      expect(csv).to.have.string('|\n|');
    });
  });
  it('textDelimiter with double quote', () => {
    jsonexport({
      a: '"',
      b: true
    }, {
      textDelimiter: '"'
    }, (err, csv) => {
      expect(csv).to.have.string('a,""');
    });
  });
  it('endOfLine', () => {
    jsonexport({
      a: true,
      b: true
    }, {
      endOfLine: '|'
    }, (err, csv) => {
      expect(csv).to.have.string('a,true|b,true');
    });
  });
  it('mainPathItem', () => {
    // Object
    jsonexport({
      a: true,
      b: true
    }, {
      mainPathItem: 'main'
    }, (err, csv) => {
      expect(csv).to.have.string(`main.a,true${os.EOL}main.b,true`);
    });
    // Array
    jsonexport([{
      a: true
    }, {
      b: true
    }], {
      mainPathItem: 'main'
    }, (err, csv) => {
      expect(csv).to.have.string('main.a,main.b');
    });
  });
  it('mainPathItem', () => {
    jsonexport({
      a: [1, 2],
      b: true
    }, {
      arrayPathString: '|'
    }, (err, csv) => {
      expect(csv).to.have.string('a,1|2');
    });
  });
  it('booleanTrueString', () => {
    jsonexport({
      a: true,
      b: true
    }, {
      booleanTrueString: 'test'
    }, (err, csv) => {
      expect(csv).to.have.string('a,test');
    });
  });
  it('booleanFalseString', () => {
    jsonexport({
      a: false,
      b: true
    }, {
      booleanFalseString: 'test'
    }, (err, csv) => {
      expect(csv).to.have.string('a,test');
    });
  });
  it('includeHeaders', () => {
    jsonexport([{
      a: true
    }, {
      a: false
    }], {
      includeHeaders: false
    }, (err, csv) => {
      expect(csv).to.have.string(`true${os.EOL}false`);
    });
  });
  it('verticalOutput', () => {
    jsonexport({
      a: true,
      b: true
    }, {
      verticalOutput: false
    }, (err, csv) => {
      expect(csv).to.have.string('a,b');
    });
  });
  describe('Type Handlers', () => {
    it('String', () => {
      jsonexport({
        a: 'test',
        b: true
      }, {
        typeHandlers: {
          String: (value) => value + "|||"
        }
      }, (err, csv) => {
        expect(csv).to.have.string('a,test|||');
      });
    });
    it('Number', () => {
      jsonexport({
        a: 1,
        b: true
      }, {
        typeHandlers: {
          Number: (value) => value + "|||"
        }
      }, (err, csv) => {
        expect(csv).to.have.string('a,1|||');
      });
    });
    it('Boolean', () => {
      jsonexport({
        a: true,
        b: true
      }, {
        typeHandlers: {
          Boolean: (value, name) => value + "|||"
        }
      }, (err, csv) => {
        expect(csv).to.have.string('a,true|||');
      });
    });
    it('Date', (done) => {
      var date = new Date();
      jsonexport({
        a: date,
        b: true
      }, {
        typeHandlers: {
          Object: (value, name) => {
            if (value instanceof Date) return date + '|||';
            return value;
          }
        }
      }, (err, csv) => {
        expect(csv).to.have.string('a,' + date + '|||');
        done();
      });
    });
  });
});
