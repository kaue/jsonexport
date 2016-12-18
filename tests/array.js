var chai = require('chai');
var expect = chai.expect;
var jsonexport = require('../lib/index');

describe('Array', () => {
    it('simple', () => {
        jsonexport([{
            name: 'Bob',
            lastname: 'Smith'
        },{
            name: 'James',
            lastname: 'David',
            escaped: 'I am a "quoted" field'
        }], {}, (err, csv) => {
            expect(csv).to.equal('name,lastname,escaped\nBob,Smith,\nJames,David,I am a ""quoted"" field');
        });
    });
    it('complex', () => {
        jsonexport([{
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
        }], {}, (err, csv) => {
            expect(csv).to.equal('name,lastname,family.name,family.type\nBob,Smith,Peter,Father\nJames,David,Julie,Mother');
        });
    });
});
