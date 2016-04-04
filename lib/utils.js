"use strict";

var _ = require('lodash');

exports.noop = function () {
};

exports.hex = hex;
function hex(num, len) {
  if (!_.isNumber(num)) return '';
  len = len || 2;
  var result = num.toString(16);
  result = _.padStart(result, len, '0');
  return result.length > len ? result.substr(result.length - len) : result;
}

exports.hex2 = function (num) {
  return hex(num, 2);
};

exports.hex4 = function (num) {
  return hex(num, 4);
};
