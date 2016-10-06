var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
var jsonexport = require('../lib/index');

const SIMPLE_OBJECT = {
    lang: 'Node.js',
    module: 'jsonexport'
};
const COMPLEX_OBJECT = {
    cars: 12,
    roads: 5,
    traffic: 'slow',
    speed: {
        max: 123,
        avg: 20,
        min: 5
    },
    size: [10,20]
};
const SIMPLE_ARRAY = [{
    name: 'Bob',
    lastname: 'Smith'
},{
    name: 'James',
    lastname: 'David'
}];
const COMPLEX_ARRAY = [{
   name: 'Bob',
   lastname: 'Smith',
   family: {
       name: 'Peter',
       type: 'Father'
   }
},{
   name: 'James',
   lastname: 'David',
   family:{
       name: 'Julie',
       type: 'Mother'
   }
}];

describe('Options', () => {
    it('headerPathString', () => {
        jsonexport({a: {b: true}}, {
            headerPathString: '|'
        }, (err, csv) => {
            expect(csv).to.have.string('a|b');
        });
    });
    it('rowDelimiter', () => {
        jsonexport({a: true, b: true}, {
            rowDelimiter: '|'
        }, (err, csv) => {
            expect(csv).to.have.string('a|true');
        });
    });
    it('textDelimiter with linebreak', () => {
        jsonexport({a: '\n', b: true}, {
            textDelimiter: '|'
        }, (err, csv) => {
            expect(csv).to.have.string('|\n|');
        });
    });
    it('textDelimiter with double quote', () => {
        jsonexport({a: '"', b: true}, {
            textDelimiter: '"'
        }, (err, csv) => {
            expect(csv).to.have.string('a,""');
        });
    });
    it('endOfLine', () => {
        jsonexport({a: true, b: true}, {
            endOfLine: '|'
        }, (err, csv) => {
            expect(csv).to.have.string('a,true|b,true');
        });
    });
    it('mainPathItem', () => {
        // Object
        jsonexport({a: true, b: true}, {
            mainPathItem: 'main'
        }, (err, csv) => {
            expect(csv).to.have.string('main.a,true\nmain.b,true');
        });
        // Array
        jsonexport([{a: true}, {b: true}], {
            mainPathItem: 'main'
        }, (err, csv) => {
            expect(csv).to.have.string('main.a,main.b');
        });
    });
    it('mainPathItem', () => {
        jsonexport({a: [1, 2], b: true}, {
            arrayPathString: '|'
        }, (err, csv) => {
            expect(csv).to.have.string('a,1|2');
        });
    });
    it('booleanTrueString', () => {
        jsonexport({a: true, b: true}, {
            booleanTrueString: 'test'
        }, (err, csv) => {
            expect(csv).to.have.string('a,test');
        });
    });
    it('booleanFalseString', () => {
        jsonexport({a: false, b: true}, {
            booleanFalseString: 'test'
        }, (err, csv) => {
            expect(csv).to.have.string('a,test');
        });
    });
    it('includeHeaders', () => {
        jsonexport([{a: true}, {a: false}], {
            includeHeaders: false
        }, (err, csv) => {
            expect(csv).to.have.string('true\nfalse');
        });
    });
    it('orderHeaders', () => {
        jsonexport([{b: false}, {a: true}, {a: true}], {
            orderHeaders: true
        }, (err, csv) => {
            expect(csv).to.have.string('a,b');
        });
        jsonexport([{b: false}, {a: true}, {a: true}], {
            orderHeaders: false
        }, (err, csv) => {
            expect(csv).to.have.string('b,a');
        });
    });
    it('verticalOutput', () => {
        jsonexport({a: true, b: true}, {
            verticalOutput: false
        }, (err, csv) => {
            expect(csv).to.have.string('a,b');
        });
    });
    it('handleString', () => {
        jsonexport({a: 'test', b: true}, {
            handleString: (value, name) => value + "|||"
        }, (err, csv) => {
            expect(csv).to.have.string('a,test|||');
        });
    });
    it('handleNumber', () => {
        jsonexport({a: 1, b: true}, {
            handleNumber: (value, name) => value + "|||"
        }, (err, csv) => {
            expect(csv).to.have.string('a,1|||');
        });
    });
    it('handleBoolean', () => {
        jsonexport({a: true, b: true}, {
            handleBoolean: (value, name) => value + "|||"
        }, (err, csv) => {
            expect(csv).to.have.string('a,true|||');
        });
    });
    it('handleDate', () => {
        var date = new Date();
        jsonexport({a: date, b: true}, {
            handleDate: (value, name) => value + "|||"
        }, (err, csv) => {
            expect(csv).to.have.string('a,' + date + '|||');
        });
    });    
})
