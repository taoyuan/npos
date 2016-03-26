"use strict";

var fs = require('fs');
var path = require('path');
var npos = require('..');
var raster = npos.codecs.raster;

var file = './fixtures/raws/raster.bin';
var raw = fs.readFileSync(file);

var result = npos.bitimage();
var image = raw;
while (image = raster.decode(image)) {
  result.append(image);
}

console.log(result.render());

result.toJimp().write(path.join(__dirname, 'output', path.basename(file, '.bin') + '.png'));
