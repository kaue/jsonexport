const helper = require('../core/helper');

class Handler {
  constructor(options) {
    this._options = options;
  }

  _setHeaders(result, item) {
    let self = this;
    if (!item) return result;
    return result.map(function(element) {
      element.item = element.item ? item + self._options.headerPathString + element.item : item;
      return element;
    });
  }
  /**
   * Check the element type of the element call the correct handle function
   *
   * @param element Element that will be checked
   * @param item Used to make the headers/path breadcrumb
   */
  check(element, item) {
    let result;
    //Check if element is a String
    if (helper.isString(element)) {
      result = [{
        item: item,
        value: (this._options.handleString || this._handleString)(element, item),
      }];
    }
    //Check if element is a Number
    else if (helper.isNumber(element)) {
      result = [{
        item: item,
        value: (this._options.handleNumber || this._handleNumber)(element, item),
      }];
    }
    //Check if element is a Boolean
    else if (helper.isBoolean(element)) {
      result = [{
        item: item,
        value: (this._options.handleBoolean || this._handleBoolean).bind(this)(element, item),
      }];
    }
    //Check if element is a Date
    else if (helper.isDate(element)) {
      result = [{
        item: item,
        value: (this._options.handleDate || this._handleDate)(element, item),
      }];
    }
    //Check if element is an Array
    else if (helper.isArray(element)) {
      var resultArray = this._handleArray(element, item);
      result = this._setHeaders(resultArray, item);
    }
    //Check if element is a Object
    else if (helper.isObject(element)) {
      var resultObject = this._handleObject(element, item);
      result = this._setHeaders(resultObject, item);
    } else {
      result = [{
        item: item,
        value: '',
      }];
    }
    return result;
  }


  /**
   * Handle all Objects
   *
   * @param {Object} obj
   * @returns {Array} result
   */
  _handleObject(obj) {
    var result = [];
    //Look every object props
    for (var prop in obj) {
      var propData = obj[prop];
      //Check the propData type
      var resultCheckType = this.check(propData, prop);
      //Append to results
      result = result.concat(resultCheckType);
    }
    return result;
  }
  /**
   * Handle all Arrays, merges arrays with primitive types in a single value
   *
   * @param {Array} array
   * @returns {Array} result
   */
  _handleArray(array) {
    let self = this;
    let result = [];
    var firstElementWithoutItem;
    for (let element of array) {
      //Check the propData type
      var resultCheckType = self.check(element);
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
