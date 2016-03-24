"use strict";

var _ = require('lodash');
var nescpos = require('../');
var parser = nescpos.Parser();
var raster = nescpos.codecs.raster;

var raw = require('./fixtures/raws/raster-1');
var result = parser.parse(raw);
console.log(result.commands);

console.log('Raster Image:');

_.forEach(result.commands, function (cmd) {
  if (cmd.ctrl === 'GS' && cmd.fn === 'v0') {
    raster.decode(raw, cmd.offset).print();
  }
});
