'use strict';

var utils = require('../utils');

module.exports = Console;

function Console(readable) {
  this.readable = readable;
}

Console.prototype.open = function (cb) {
  cb && cb();
};

Console.prototype.close = function (cb) {
  cb && cb();
};

Console.prototype.write = function (data, cb) {
  var hexy = utils.tryload('hexy');
  if (this.readable && hexy) {
    console.log(hexy.hexy(data, {format: 'twos'}));
  } else {
    console.log(hexdata(data, 32));
  }
  cb && cb();
};

var table = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
function hex(num, bits) {
  bits = bits || 8;
  var n = bits / 4;
  var result = '';
  for (var i = n - 1; i >= 0; i--) {
    result += table[(num >> (i * 4)) & 0xF];
  }
  return result;
}

function hexdata(data, n) {
  n = n || 16;
  var result = '';
  for (var i = 0; i < data.length; i++) {
    result += hex(data[i]) + ' ';
    if ((i + 1) % n === 0) result += '\n';
  }
  return result;
}
