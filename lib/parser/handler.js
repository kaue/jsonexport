/* jshint node:true */
'use strict';

const helper = require('../core/helper');

class Handler {
  constructor(options) {
    this._options = options;

    //an object of {typeName:(value,index,parent)=>any}
    this._options.typeHandlers = this._options.typeHandlers || {};

    //deprecated options
    this._options.handleString = this._options.handleString ? warnDepOp('handleString', this._options.handleString) : this._handleString;
    this._options.handleNumber = this._options.handleNumber ? warnDepOp('handleNumber', this._options.handleNumber) : this._handleNumber;
    this._options.handleBoolean = this._options.handleBoolean ? warnDepOp('handleBoolean', this._options.handleBoolean) : this._handleBoolean;
    this._options.handleDate = this._options.handleDate ? warnDepOp('handleDate', this._options.handleDate) : this._handleDate;
  }

  /**
   * Check if results needing mapping to alternate value
   *
   * @returns [{item, value}] result
   */
  _setHeaders(result, item) {
    let self = this;
    if (!item) return result;
    return result.map(function(element) {
      element.item = element.item ? item + self._options.headerPathString + element.item : item;
      return element;
    });
  }

  castValue(element, item, index, parent){
    //cast by matching constructor
    const types = this._options.typeHandlers;
    for (let type in types ) {
      if( isInstanceOfTypeName(element,type) ){
        element = types[type].call(types, element, index, parent);
        break;//first match we move on
      }
    }

    return element;
  }

  checkComplex(element, item){
    //Check if element is a Date
    if (helper.isDate(element)) {
      return [{
        item: item,
        value: this._options.handleDate(element, item),
      }];
    }
    //Check if element is an Array
    else if (helper.isArray(element)) {
      var resultArray = this._handleArray(element, item);
      return this._setHeaders(resultArray, item);
    }
    //Check if element is a Object
    else if (helper.isObject(element)) {
      var resultObject = this._handleObject(element);
      return this._setHeaders(resultObject, item);
    }

    return [{
      item: item,
      value: '',
    }];
  }
  
  /**
   * Check the element type of the element call the correct handle function
   *
   * @param element Element that will be checked
   * @param item Used to make the headers/path breadcrumb
   * @returns [{item, value}] result
   */
  check(element, item, index, parent) {
    element = this.castValue(element, item, index, parent);

    //try simple value by highier performance switch
    switch(typeof element){
      case 'string':
        return [{
          item: item,
          value: this._options.handleString(element, item),
        }];

      case 'number':
        return [{
          item: item,
          value: this._options.handleNumber(element, item),
        }];

      case 'boolean':
        return [{
          item: item,
          value: this._options.handleBoolean.bind(this)(element, item),
        }];
    }

    return this.checkComplex(element, item);
  }


  /**
   * Handle all Objects
   *
   * @param {Object} obj
   * @returns [{item, value}] result
   */
  _handleObject(obj) {
    var result = [];
    //Look every object props
    for (var prop in obj) {
      var propData = obj[prop];
      //Check the propData type
      var resultCheckType = this.check(propData, prop, prop, obj);
      //Append to results aka merge results aka array-append-array
      result = result.concat(resultCheckType);
    }
    return result;
  }
  
  /**
   * Handle all Arrays, merges arrays with primitive types in a single value
   *
   * @param {Array} array
   * @returns [{item, value}] result
   */
  _handleArray(array) {
    let self = this;
    let result = [];
    var firstElementWithoutItem;
    for (let aIndex=0; aIndex < array.length; ++aIndex) {
      let element = array[aIndex];
      //Check the propData type
      var resultCheckType = self.check(element, null, aIndex, array);
      //Check for results without itens, merge all itens with the first occurrence
      if (resultCheckType.length === 0) continue;
      var firstResult = resultCheckType[0];
      if (!firstResult.item && firstElementWithoutItem !== undefined) {
        firstElementWithoutItem.value += self._options.arrayPathString + firstResult.value;
        continue;
      } else if (resultCheckType.length > 0 && !firstResult.item && firstElementWithoutItem === undefined) {
        firstElementWithoutItem = firstResult;
      }
      //Append to results
      result = result.concat(resultCheckType);
    }
    return result;
  }
  /**
   * Handle all Boolean variables, can be replaced with options.handleBoolean
   *
   * @param {Boolean} boolean
   * @returns {String} result
   */
  _handleBoolean(boolean) {
    var result;
    //Check for booolean options
    if (boolean) {
      result = this._options.booleanTrueString || 'true';
    } else {
      result = this._options.booleanFalseString || 'false';
    }
    return result;
  }
  /**
   * Handle all String variables, can be replaced with options.handleString
   *
   * @param {String} string
   * @returns {String} string
   */
  _handleString(string) {
    return string;
  }
  /**
   * Handle all Number variables, can be replaced with options.handleNumber
   *
   * @param {Number} number
   * @returns {Number} number
   */
  _handleNumber(number) {
    return number;
  }
  /**
   * Handle all Date variables, can be replaced with options.handleDate
   *
   * @param {Date} number
   * @returns {string} result
   */
  _handleDate(date) {
    return date.toLocaleDateString();
  }

}

module.exports = Handler;

function warnDepOp(optionName, backOut){
  console.warn("[jsonexport]: option "+optionName+" has been deprecated. Use option.typeHandlers");
  return backOut;
}

const globalScope = typeof(window)==="undefined" ? global : window;
function isInstanceOfTypeName(element, typeName){
  if( element instanceof globalScope[typeName] ){
    return true;//Buffer and complex objects
  }

  //literals in javascript cannot be checked by instance of
  switch( typeof(element) ){
    case 'string':return typeName==="String";
    case 'boolean':return typeName==="Boolean";
    case 'number':return typeName==="Number";
  }

  return false;
}