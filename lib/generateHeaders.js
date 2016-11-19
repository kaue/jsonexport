/**
 * Generate the file headers with optional sorting by header usage
 *
 * @param {Array} parseResult
 * @returns {Array} headers
 */
module.exports = function generateHeaders(parseResult){
    var headers = [];
    var headerCount = [];
    //Check all the parsed json results
    parseResult.forEach(function (result) {
        result.forEach(function (element) {
            if(headerCount[element.item])
                headerCount[element.item] += 1;
            else
                headerCount[element.item] = 1;
        });

    });
    var headerSort = [];
    //Create a sortable collection of headers
    for(var header in headerCount){
        if(headerCount.hasOwnProperty(header)){
            headerSort.push({
                name: header,
                count: headerCount[header]
            });
        }
    }
    if(options.orderHeaders){
        //Sort the headers based on the count.
        headerSort = _.sortBy(headerSort,'count').reverse();
    }
    //Create the headers list
    headerSort.forEach(function (header) {
        headers.push(header.name);
    });
    //Return the headers
    return headers;
}
