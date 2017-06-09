'use strict';

module.exports.isFunction = (fn) => {
    var getType = {};
    return fn && getType.toString.call(fn) === '[object Function]';
};

module.exports.isArray = (arr) => Array.isArray(arr);

module.exports.isObject = (obj) => obj instanceof Object;

module.exports.isString = (str) => typeof str === 'string';

module.exports.isNumber = (num) => typeof num === 'number';

module.exports.isBoolean = (bool) => typeof bool === 'boolean';

module.exports.isDate = (date) => date instanceof Date;
