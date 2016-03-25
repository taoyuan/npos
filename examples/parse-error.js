'use strict';

var Parser = require('../').Parser;
var parser = new Parser();
var buffer = require('./fixtures/raws/invalid');
var result = parser.parse(buffer);

console.log(result);
