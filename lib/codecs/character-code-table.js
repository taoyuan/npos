"use strict";

var _ = require('lodash');

exports.name = 'character-code-table';
exports.commands = ['ESCt'];

const CHARACTER_CODE_TABLE = {
  0: 'PC437',
  1: 'Katakana',
  2: 'PC850',
  3: 'PC860',
  4: 'PC863',
  5: 'PC865',
  16: 'WPC1252',
  17: 'PC866',
  18: 'PC852',
  19: 'PC858',
  20: 'Thai42',
  21: 'Thai11',
  22: 'Thai13',
  23: 'Thai14',
  24: 'Thai16',
  25: 'Thai17',
  26: 'Thai18',
  255: 'Blank',
};

exports.decode = function (raw, nodes) {
  // pick last node from continuous nodes
  var node = _.last(nodes);
  var value = raw[node.offset + 2];
  // number value for unknown code table
  return CHARACTER_CODE_TABLE[value] || value;
};
