'use strict';

var npos = require('..');

var parser = npos.parser();
var buffer = require('./fixtures/text-1');
parser.parse(buffer).then(function (ast) {
  var text = '';
  ast.entries.forEach(function (entry) {
    if (entry.type === 'text') {
      text += entry.data.toString();
    }
  });
  console.log(text);
});
