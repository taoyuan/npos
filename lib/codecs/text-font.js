"use strict";

var _ = require('lodash');

exports.name = 'font';
exports.commands = ['ESCM'];

exports.decode = function (raw, nodes) {
  if (!Array.isArray(nodes)) {
    nodes = [nodes];
  }

  const node = _.last(nodes);
  const value = raw[node.offset + 2];
  if (value === 0 || value === 48) {
    return 'A';
  }
  if (value === 1 || value === 49) {
    return 'B';
  }
  if (value === 2 || value === 50) {
    return 'C';
  }
  return 'A';
};
