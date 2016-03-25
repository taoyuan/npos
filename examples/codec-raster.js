"use strict";

var path = require('path');
var npos = require('..');
var raster = npos.codecs.raster;

var file = './fixtures/raws/raster-2';
var raw = require(file);

var result = npos.bitimage();
var image = raw;
while (image = raster.decode(image)) {
  result.append(image);
}

console.log(result.render());

result.toJimp().write(path.join(__dirname, 'output', path.basename(file, '.js') + '.png'));
