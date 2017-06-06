var jsonexport = require('jsonexport');

var contacts = [{
    name: 'Bob',
    lastname: 'Smith'
},{
    name: 'James',
    lastname: 'David'
},{
    name: 'Robert',
    lastname: 'Miller'
},{
    name: 'David',
    lastname: 'Martin'
}];

jsonexport(contacts, function(err, csv){
    if(err) return console.log(err);
    console.log(csv);
});
