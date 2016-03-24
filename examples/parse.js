'use strict';

var _ = require('lodash');
var iconv = require('iconv-lite');
var Parser = require('../').Parser;

var parser = new Parser();

var result;

// text 1
var buffer = require('./fixtures/raws/text-1');
result = parser.parse(buffer);
console.log('[text-1]');
console.log(result.commands);
console.log(iconv.decode(result.content, 'GB2312'));
console.log('****************************');

var commands = result.commands;
var command = _.find(commands, function (cmd) { // find cut command
  return cmd.ctrl === 'GS' && cmd.fn === 'V';
});

if (command) {
  console.log('Found cut command:');
  console.log(command);
} else {
  console.log('Not found cut command:');
}

console.log('****************************');

// text 2

result = parser.parse(require('./fixtures/raws/text-2'));
console.log('[text-2]');
console.log(result.commands);
console.log(iconv.decode(result.content, 'GB2312'));
console.log('****************************');

// raster 1

result = parser.parse(require('./fixtures/raws/raster-1'));
console.log('[raster-1]');
console.log(result.commands);
console.log('****************************');
