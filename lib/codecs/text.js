"use strict";

var _ = require('lodash');

exports.commands = ['STX', 'TXT', 'TEXT'];

exports.decode = function (raw, nodes) {
  if (!Array.isArray(nodes)) {
    nodes = [nodes];
  }

  var total = 0, buffers = [];

  _.forEach(nodes, function (node) {
    buffers.push(raw.slice(node.offset, node.offset + node.length));
    total += node.length;
  });

  return buffers.length > 1 ? Buffer.concat(buffers, total) : buffers[0];
};
