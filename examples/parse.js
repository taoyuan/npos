"use strict";

var fs = require('fs');
var path = require('path');
var npos = require('../');
var parser = npos.parser();

var raw = fs.readFileSync(path.join(__dirname, 'fixtures', 'receipt.bin'));
console.time('parse');
parser.parse(raw).then(function (ast) {
  console.log(ast);
});
