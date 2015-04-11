# jsonexport
Makes easy to convert JSON to CSV

#Usage
Installation command is `npm install jsonexport`.


##jsonArray Example

###Simple Array
####Code
```javascript

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

    jsonexport(contacts,function(err, csv){
        if(err) return console.log(err);
        console.log(csv);
    });

```

####Result

`

    name;lastname
    Bob;Smith
    James;David
    Robert;Miller
    David;Martin

`


###

var jsonArray = [
    {
        "test":{"car": "Audi"},
        "price": 40000,
        "color": "blue",
        "arr": ['a', 'b', 'c', {sub: 'item', boltest: false}]
    }, {
        "test":{"car": "Audi"},
        "price": 35000,
        "color": "black"
    }, {
        "test":{"car": "Audi"},
        "price": 60000,
        "color": "green"
    },{
        "hey": "you",
        "color": "black"
    }
];

var jsonObject = {
    'car': 'Por',
    'price': 123,
    'sold': true,
    'info':{
        'gas': 10,
        'location': [1234,4321]
    }
}
module.exports(jsonObject, function(err, csv){
    if(err) return console.log(err);
    console.log(csv);
});