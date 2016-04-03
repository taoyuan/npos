'use strict';

var npos = require('..');

var parser = npos.parser();
var buffer = require('./fixtures/text-1');
parser.parse(buffer).then(function (ast) {
  npos.textualize(ast).then(function (results) {
    console.log(results);
  });
});
