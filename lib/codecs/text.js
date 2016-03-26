"use strict";

exports.commands = ['STX', 'TXT', 'TEXT'];

exports.decode = function (raw, offset, length) {
  return raw.slice(offset, offset + length);
};
