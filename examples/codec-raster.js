"use strict";

var fs = require('fs');
var path = require('path');
var npos = require('..');
var renderer = require('../lib/renderer');
var raster = npos.codecs.raster;

var file =path.join(__dirname, 'fixtures', 'raster.bin');
var raw = fs.readFileSync(file);

// decode first raster image from raw
var image = raster.decode(raw);
console.log(renderer.render('text', image));

image.save(path.join(__dirname, 'output', path.basename(file, '.bin') + '.png'));
