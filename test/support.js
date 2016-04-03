"use strict";

var path = require('path');

exports.fixtures = function () {
  var args = [__dirname, 'fixtures'].concat(Array.prototype.slice.call(arguments));
  return path.resolve.apply(undefined, args);
};
