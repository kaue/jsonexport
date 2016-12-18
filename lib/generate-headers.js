var _ = require('underscore');

/**
 * Generate the file headers with optional sorting by header usage
 *
 * @param {Array} parseResult
 * @returns {Array} headers
 */
module.exports = function generateHeaders(escapeDelimiters) {
  
  return function (parseResult, orderHeaders){

    //Check all the parsed json results
    var headersCount = parseResult.reduce(function (mem, result) {
        result.forEach(function (element) {
            mem[element.item] = (mem[element.item] || 0) + 1;
        });
        return mem;
    }, {});

    var headerSort = Object.keys(headersCount);

    // Sort the headers based on the count.
    if(orderHeaders){
        headerSort = headerSort.map(function (header) {
            return {
                name: header,
                count: headersCount[header],
            };
        });
        headerSort = _.sortBy(headerSort,'count')
            .reverse()
            .map(function (header) { return header.name; });
    }

    //Return the headers list
    return headerSort.map(function(header) { return escapeDelimiters(header); });
  };
};
