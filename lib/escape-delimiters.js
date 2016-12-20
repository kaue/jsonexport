// Escape the textDelimiters contained in the field
/*(https://tools.ietf.org/html/rfc4180)
   7.  If double-quotes are used to enclose fields, then a double-quote
   appearing inside a field must be escaped by preceding it with
   another double quote.
   For example: "aaa","b""bb","ccc"
*/

module.exports = function escapedDelimiters(textDelimiter, rowDelimiter, endOfLine) {

  if (typeof textDelimiter !== 'string') {
    throw new TypeError('Invalid param "textDelimiter", must be a string.');
  }

  if (typeof rowDelimiter !== 'string') {
    throw new TypeError('Invalid param "rowDelimiter", must be a string.');
  }

  if (typeof endOfLine !== 'string') {
    throw new TypeError('Invalid param "endOfLine", must be a string.');
  }

  var textDelimiterRegex = new RegExp("\\" + textDelimiter, 'g');
  var escapedDelimiter = textDelimiter + textDelimiter;

  return function(value) {
    if (!value.replace) return value;
    // Escape the textDelimiters contained in the field
    var newValue = value.replace(textDelimiterRegex, escapedDelimiter);
    // Escape the whole field if it contains a rowDelimiter or a linebreak
    if (newValue.indexOf(rowDelimiter) >= 0 || newValue.indexOf(endOfLine) >= 0) {
      newValue = textDelimiter + newValue + textDelimiter;
    }

    return newValue;
  };
};
