/* jshint node:true */
/* jshint esversion: 6 */
/* jshint -W030 */

var chai = require('chai');
var expect = chai.expect;
var jsonexport = require('../lib/index');
var os = require('os');


const isRemoteTest = process.env.APPVEYOR || process.env.TRAVIS;
if( isRemoteTest ){
  console.log('\x1b[34mRemote testing server detected on '+os.type()+' '+os.platform()+' '+os.release()+'\x1b[0m');
}

describe('Object', () => {
  it('simple', () => {
    jsonexport({
      lang: 'Node.js',
      module: 'jsonexport'
    }, {}, (err, csv) => {
      expect(csv).to.equal(`lang,Node.js${os.EOL}module,jsonexport`);
    });
  });

  it('complex', () => {
    jsonexport({
      cars: 12,
      roads: 5,
      traffic: 'slow',
      speed: {
        max: 123,
        avg: 20,
        min: 5
      },
      size: [10, 20],
      escaped: 'I am a "quoted" field'
    }, {}, (err, csv) => {
      expect(csv).to.equal(`cars,12${os.EOL}roads,5${os.EOL}traffic,slow${os.EOL}speed.max,123${os.EOL}speed.avg,20${os.EOL}speed.min,5${os.EOL}size,10;20${os.EOL}escaped,"I am a ""quoted"" field"`);
    });
  });

  it('Github #41 p1',()=>{
    var contacts = [{
        name: 'Bob',
        lastname: 'Smith',
        status: null,
        test: true
    },{
        name: 'James',
        lastname: 'David',
        status: 'fired',
        test: true
    }];

    jsonexport(contacts, (err, csv)=>{
      expect(csv).to.equal(`name,lastname,status,test${os.EOL}Bob,Smith,,true${os.EOL}James,David,fired,true`);
    });
  });

  it('Github #41 p2',()=>{
    var contacts = {
      'a' : 'another field',
      'b' : '',
      'c' : 'other field'
    };

    jsonexport(contacts, (err, csv)=>{
      expect(csv).to.equal(`a,another field${os.EOL}b,${os.EOL}c,other field`);
    });
  });

  it('Buffer to String - Github #48',()=>{
    var contacts = {
      '0' : true,
      '1' : [11,22,33],
      '2' : ()=>'bad ace',
      'a' : Buffer.from('a2b', 'utf8'),
      'b' : 'x',
      'c' : 99,
      'd' : {
        x:Buffer.from('other field', 'utf8')
      }
    };

    var options={
      typeHandlers:{
        Array:function(value,index,parent){
          return 'replaced-array';
        },
        Boolean:function(value,index,parent){
          return 'replaced-boolean';
        },
        Function:function(value,index,parent){
          return value();
        },
        Number:function(value,index,parent){
          return 'replaced-number';
        },
        String:function(value,index,parent){
          return 'replaced-string';
        },
        Buffer:function(value,index,parent){
          if(parent===contacts){
            return 'parentless-'+index;
          }
          
          return value.toString();
        }
      }
    };

    jsonexport(contacts, options, (err, csv)=>{
      expect(csv).to.equal(`0,replaced-boolean${os.EOL}1,replaced-array${os.EOL}2,bad ace${os.EOL}a,parentless-a${os.EOL}b,replaced-string${os.EOL}c,replaced-number${os.EOL}d.x,other field`);
    });
  });
});