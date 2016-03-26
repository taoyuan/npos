'use strict';

var npos = require('..');

var parser = npos.parser();
parser.use(npos.translators.text());

var buffer = require('./fixtures/raws/text-1');
parser.parse(buffer).then(function (context) {
  console.log('****************************');
  console.log(context.ast.tree);
  console.log('----------------------------');
  console.log(context.text);
  console.log('****************************');
});
