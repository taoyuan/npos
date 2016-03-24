'use strict';

var Parser = require('../').Parser;

var parser = new Parser();

var result;

// receipt 1
var buffer = require('./fixtures/invalid');
result = parser.parse(buffer);

console.log(result);
