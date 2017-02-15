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

exports.tryload = function (pkg, message) {
  var result;
  try {
    result = require(pkg);
  } catch (e) {
    if (/Cannot find module/.test(e.message)) {
      if (message === true) {
        message = `Library "${pkg}" is required. To fix this, run: \n\n  npm install ${pkg} --save\n`;
      }
      if (typeof message === 'string') {
        throw new Error(message);
      } else if (message) {
        throw message;
      }
    } else {
      throw e;
    }
  }
  return result;
};
