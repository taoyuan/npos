"use strict";

var fs = require('fs');
var path = require('path');
var npos = require('../');
var Parser = npos.Parser;
var raster = npos.codecs.raster;

var parser = new Parser();

parser.use(function (ctx) {
  if (ctx.node.type === 'raster' && ctx.node.data) {
    ctx.data = ctx.node.data.render();
  }
});

var raw = fs.readFileSync(path.join(__dirname, 'fixtures/raws/raster.bin'));
parser.parse(raw).then(function (data) {
  console.log(data);
});
