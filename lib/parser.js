'use strict';

var util = require('util');
var _ = require('lodash');
var ascii = require('./ascii');
var decoders = require('./decoders');
var utils = require('./utils');

module.exports = Parser;

/**
 *
 * @param rules
 * @constructor
 */
function Parser(rules) {
  if (!(this instanceof Parser)) {
    return new Parser(rules);
  }

  if (!rules) {
    rules = require('./rules');
  }
  this.rules = rules;

  this.rules = _.transform(rules, function (result, group, key) {
    result[key] = _.transform(group, function (result, rule, key) {
      result[key] = Array.isArray(rule) ? rule : [rule];
    });
  });
}

/**
 *
 * @param buffer
 * @param {Boolean} [returnArray]
 */
Parser.prototype.parse = function (buffer, returnArray) {
  if (!Buffer.isBuffer(buffer)) buffer = new Buffer(buffer);

  var rules = this.rules;

  var i, byte, group, found, command, err;
  var commands = [];
  var text = [];
  var offset = 0;

  while (offset < buffer.length) {
    byte = buffer[offset++];
    group = rules[byte];

    if (group !== undefined && group !== null) {

      command = {
        code: utils.hex2(byte).toUpperCase(),//String.fromCharCode(byte),
        ctrl: ascii[byte],
        offset: offset - 1,
        length: 1
      };
      commands.push(command);

      if (_.isNumber(group)) {
        offset += group;
        command = null;
      } else {

        found = false;

        _.forEach(group, function (rule, key) {
          if (buffer.length < offset + key.length) return;

          found = true;
          for (i = 0; i < key.length; i++) {
            if (key.charCodeAt(i) !== buffer[offset + i]) {
              found = false;
              break;
            }
          }
          if (!found) return;

          command.fn = key;

          offset += key.length;

          _.forEach(rule, function (item) {
            if (_.isString(item)) {
              item = decoders[item];
            }

            if (_.isNumber(item)) {
              offset += item;
            } else if (_.isFunction(item)) {
              offset += item(buffer, offset);
            }
          });

          command.length = offset - command.offset;
          return false; // break _.forEach(group, ...)
        });
        if (!found) {
          err = createUnknownDirectiveError(buffer, offset - 1);
          break;
        }
      }

      command = null;
    } else {
      if (!command) {
        command = {
          code: '\x02',
          ctrl: 'STX',
          offset: offset - 1,
          length: 0
        };
        commands.push(command);
      }
      command.length++;
      text.push(byte);
    }
  }

  if (err) {
    return {error: err};
  }

  return {commands: commands, content: returnArray ? text : new Buffer(text)};
};

function createUnknownDirectiveError(buffer, offset) {
  return new Error(util.format('Can not parse commands - [%s %s] <(%d/%d) %s>'
    , ascii[buffer[offset]], ascii[buffer[offset + 1]], offset, buffer.length,
    hex(buffer.slice(offset, Math.min(buffer.length, offset + 10)))));
}

function hex(data, separator) {
  separator = separator || ' ';
  var str = '';
  _.forEach(data, function (b, index) {
    var h = b.toString(16);
    str += h.length < 2 ? '0' + h : h;
    if (separator.length > 0 && index < data.length - 1) {
      str += separator;
    }
  });
  return str;
}
