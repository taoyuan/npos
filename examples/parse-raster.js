"use strict";

var _ = require('lodash');
var npos = require('../');
var parser = npos.Parser();
var raster = npos.codecs.raster;

var raw = require('./fixtures/raws/raster-2');
var result = parser.parse(raw);
console.log(result.commands);

console.log('Raster Image:');

var text = '';
_.forEach(result.commands, function (cmd) {
  if (cmd.ctrl === 'GS' && cmd.fn === 'v0') {
    text += raster.decode(raw, cmd.offset).render();
  }
});
console.log(text);
