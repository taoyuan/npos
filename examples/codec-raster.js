"use strict";

var path = require('path');
var nescpos = require('..');
var raster = nescpos.codecs.raster;

var file = './fixtures/raws/raster-1';
var raw = require(file);

var result = nescpos.bitimage();
var image = raw;
while (image = raster.decode(image)) {
  result.append(image);
}

console.log(result.render());

result.toJimp().write(path.join(__dirname, 'output', path.basename(file, '.js') + '.png'));
