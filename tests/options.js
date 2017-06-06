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
  describe('Handlers', () => {
    it('handleString', () => {
      jsonexport({
        a: 'test',
        b: true
      }, {
        handleString: (value, name) => value + "|||"
      }, (err, csv) => {
        expect(csv).to.have.string('a,test|||');
      });
    });
    it('handleNumber', () => {
      jsonexport({
        a: 1,
        b: true
      }, {
        handleNumber: (value, name) => value + "|||"
      }, (err, csv) => {
        expect(csv).to.have.string('a,1|||');
      });
    });
    it('handleBoolean', () => {
      jsonexport({
        a: true,
        b: true
      }, {
        handleBoolean: (value, name) => value + "|||"
      }, (err, csv) => {
        expect(csv).to.have.string('a,true|||');
      });
    });
    it('handleDate', () => {
      var date = new Date();
      jsonexport({
        a: date,
        b: true
      }, {
        handleDate: (value, name) => value + "|||"
      }, (err, csv) => {
        expect(csv).to.have.string('a,' + date + '|||');
      });
    });
  });
});
