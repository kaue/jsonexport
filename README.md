# jsonexport

[![Travis](https://travis-ci.org/kauegimenes/jsonexport.svg)](https://travis-ci.org/kauegimenes/jsonexport)
[![bitHound Overall Score](https://www.bithound.io/github/kauegimenes/jsonexport/badges/score.svg)](https://www.bithound.io/github/kauegimenes/jsonexport)
[![bitHound Code](https://www.bithound.io/github/kauegimenes/jsonexport/badges/code.svg)](https://www.bithound.io/github/kauegimenes/jsonexport)
[![Known Vulnerabilities](https://snyk.io/test/npm/jsonexport/badge.svg)](https://snyk.io/test/npm/jsonexport)
[![NPM Version](http://img.shields.io/npm/v/jsonexport.svg?style=flat)](https://www.npmjs.org/package/jsonexport)
[![NPM Downloads](https://img.shields.io/npm/dm/jsonexport.svg?style=flat)](https://www.npmjs.org/package/jsonexport)
[![NPM Downloads](https://img.shields.io/npm/dt/jsonexport.svg?style=flat)](https://www.npmjs.org/package/jsonexport)
[![NPM License](https://img.shields.io/npm/l/jsonexport.svg?style=flat)](https://www.npmjs.org/package/jsonexport)
[![Try jsonexport on RunKit](https://badge.runkitcdn.com/jsonexport.svg)](https://npm.runkit.com/jsonexport)

This module makes easy to convert JSON to CSV and its very customizable.

[Project Page](http://kauegimenes.github.io/jsonexport/)

<details>
  <summary><b>Table of Contents</b></summary>

- [Usage](#usage)
- [CLI](#cli)
- [Browser](#browser)
- [Stream](#stream)
- [JSON Array Example](#json-array-example)
- [Customization](#customization)

</details>


# Usage

Installation command is `npm install jsonexport`.

Run tests with `npm test`.

```javascript
var jsonexport = require('jsonexport');

jsonexport({lang: 'Node.js',module: 'jsonexport'}, {rowDelimiter: '|'}, function(err, csv){
    if(err) return console.log(err);
    console.log(csv);
});
```

## CLI

Global installation command is `npm install -g jsonexport`.

Convert JSON to CSV using `cat data.json | jsonexport` or `jsonexport data.json`

Usage: `jsonexport <JSON filename> <CSV filename>`

## Browser
Use the code in the folder named **dist** to run jsonexport in the browser

### Browser Import Examples

Webpack
```javascript
var jsonexport = require("jsonexport/dist")
```

Typescript
```javascript
import * as jsonexport from "jsonexport/dist"
```

## Stream

```javascript
var jsonexport = require('jsonexport');
var fs = require('fs');

var reader = fs.createReadStream('data.json');
var writer = fs.createWriteStream('out.csv');

reader.pipe(jsonexport()).pipe(writer);
```

## JSON Array Example

### Simple Array

#### Code

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

#### Result

```
name,lastname
Bob,Smith
James,David
Robert,Miller
David,Martin
```

### Complex Array

#### Code

```javascript
var jsonexport = require('jsonexport');

var contacts = [{
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
},{
   name: 'Robert',
   lastname: 'Miller',
   family: null,
   location: [1231,3214,4214]
},{
   name: 'David',
   lastname: 'Martin',
   nickname: 'dmartin'
}];

jsonexport(contacts,function(err, csv){
    if(err) return console.log(err);
    console.log(csv);
});
```

#### Result

```
name,lastname,family.name,family.type,family,location,nickname
Bob,Smith,Peter,Father
James,David,Julie,Mother
Robert,Miller,,,,1231;3214;4214
David,Martin,,,,,dmartin
```

## JSON Object Example

### Simple Object

#### Code

```javascript
var jsonexport = require('jsonexport');

var stats = {
    cars: 12,
    roads: 5,
    traffic: 'slow'
};

jsonexport(stats,function(err, csv){
    if(err) return console.log(err);
    console.log(csv);
});
```

#### Result

```
cars,12
roads,5
traffic,slow
```

### Complex Object

#### Code

```javascript
var jsonexport = require('jsonexport');

var stats = {
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

jsonexport(stats,function(err, csv){
    if(err) return console.log(err);
    console.log(csv);
});
```

#### Result

```
cars,12
roads,5
traffic,slow
speed.max,123
speed.avg,20
speed.min,5
size,10;20
```

## Customization

In order to get the most of out of this module, you can customize many parameters and functions.

#### Options

- `headerPathString` - `String` Used to create the propriety path, defaults to `.` example `contact: {name: 'example}` = `contact.name`
- `fillGaps` - `Boolean` Set this option if don't want to have empty cells in case of an object with multiple nested items (array prop), defaults to `false` [Issue #22](https://github.com/kauegimenes/jsonexport/issues/22)
- `headers` - `Array` Used to set a custom header order, defaults to `[]` example `['lastname', 'name']`
- `rename` - `Array` Used to set a custom header text, defaults to `[]` example `['Last Name', 'Name']`
- `rowDelimiter` - `String` Change the file row delimiter
    - Defaults to `,` (**cvs format**).
    - Use `\t` for **xls format**.
    - Use `;` for (**windows excel .csv format**).
- `textDelimiter` - `String` The character used to escape the text content if needed (default to `"`)
- `endOfLine` - `String` Replace the OS default EOL.
- `mainPathItem` - `String` Every header will have the `mainPathItem` as the base.
- `arrayPathString` - `String` This is used to output primitive arrays in a single column, defaults to `;`
- `booleanTrueString` - `String` Will be used instead of `true`.
- `booleanFalseString` - `String` Will be used instead of `false`.
- `includeHeaders` - `Boolean` Set this option to false to hide the CSV headers.
- `undefinedString` - `String` If you want to display a custom value for undefined strings, use this option. Defaults to ` `.
- `verticalOutput` - `Boolean` Set this option to false to create a horizontal output for JSON Objects, headers in the first row, values in the second.
- `handleString` - `Function` Use this to customize all `Strings` in the CSV file.
- `handleNumber` - `Function` Use this to customize all `Numbers` in the CSV file.
- `handleBoolean` - `Function` Use this to customize all `Booleans` in the CSV file.
- `handleDate` - `Function` Use this to customize all `Dates` in the CSV file. (default to date.toLocaleString)

### Handle Function Option Example

Lets say you want to prepend a text to every string in your CSV file, how to do it?

```javascript
var jsonexport = require('jsonexport');

var options = {
    handleString: function(string, name){
        return 'Hey - ' + string;
    }
};

jsonexport({lang: 'Node.js',module: 'jsonexport'}, options, function(err, csv){
    if(err) return console.log(err);
    console.log(csv);
});
```

The output would be:

```
lang,Hey - Node.js
module,Hey - jsonexport
```
