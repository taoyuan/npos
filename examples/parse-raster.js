"use strict";

var fs = require('fs');
var path = require('path');
var npos = require('../');
var raster = npos.codecs.raster;

var parser = npos.parser();

var raw = fs.readFileSync(path.join(__dirname, 'fixtures', 'raster.bin'));
console.time('parse');
parser.parse(raw).then(function (ast) {
  console.timeEnd('parse');
  // console.log(npos.graphic.render(ast.entries[0].data));
  // ast.entries[0].data.save('test.bmp');
});
