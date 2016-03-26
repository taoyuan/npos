"use strict";

var fs = require('fs');
var path = require('path');
var npos = require('../');
var raster = npos.codecs.raster;

var parser = npos.parser();

parser.use(function (ctx) {
  if (ctx.node.type === 'raster' && ctx.node.data) {
    ctx.text = ctx.text || '';
    ctx.text += ctx.node.data.render();
    ctx.end();
  }
});

var raw = fs.readFileSync(path.join(__dirname, 'fixtures', 'raster.bin'));
parser.parse(raw).then(function (context) {
  console.log(context.text);
});
