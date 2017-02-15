"use strict";

var _ = require('lodash');
var util = require('util');
var proback = require('proback');
var ruler = require('./ruler');
var ascii = require('./ascii');
var splitters = require('./splitters');
var codecs = require('../codecs');
var utils = require('../utils');

/**
 *
 * @param rules
 * @constructor
 */
function Parser(rules) {
  if (!(this instanceof Parser)) {
    return new Parser(rules);
  }

  this.rules = rules ? (ruler.isNormalized(rules) ? rules : ruler.normalize(rules)) : ruler.rules;
}

Parser.prototype.analyze = function (raw) {
  raw = Buffer.isBuffer(raw) ? raw : new Buffer(raw);
  var rules = this.rules;

  var i, byte, group, found, node, error;
  var tree = [];
  var offset = 0;

  while (offset < raw.length) {
    byte = raw[offset++];
    group = rules[byte];

    if (group !== undefined && group !== null) {

      node = {
        code: byte,
        hex: hex(byte).toUpperCase(),
        ascii: ascii[byte],
        offset: offset - 1,
        length: 1
      };
      tree.push(node);

      if (_.isNumber(group)) {
        offset += group;
        node = null;
      } else {

        found = false;

        _.forEach(group, function (rule, key) {
          if (raw.length < offset + key.length) return;

          found = true;
          for (i = 0; i < key.length; i++) {
            if (key.charCodeAt(i) !== raw[offset + i]) {
              found = false;
              break;
            }
          }
          if (!found) return;

          node.fn = key;

          offset += key.length;

          _.forEach(rule, function (splitter) {
            if (_.isString(splitter)) {
              splitter = splitters[splitter];
            }

            if (_.isNumber(splitter)) {
              offset += splitter;
            } else if (_.isFunction(splitter)) {
              offset += splitter(raw, offset);
            }
          });

          while (offset < raw.length && !raw[offset]) {
            offset++;
          }

          node.length = offset - node.offset;
          return false; // break _.forEach(group, ...)
        });
        if (!found) {
          error = createUnknownDirectiveError(raw, offset - 1);
          break;
        }
      }

      node = null;
    } else {
      if (!node) {
        node = {
          code: 2,
          hex: hex(2),
          ascii: 'STX',
          fn: '',
          offset: offset - 1,
          length: 0
        };
        tree.push(node);
      }
      node.length++;
    }
  }

  return {
    raw: raw,
    error: error,
    tree: error ? null : tree
  };
};

/**
 *
 * @param {Buffer|Array|Object} raw
 * @param {Object|Function} [options]
 * @param [options.encoding]
 * @param {Function} cb
 * @returns {*}
 */
Parser.prototype.parse = function (raw, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = null;
  }
  options = options || {};
  cb = cb || proback();

  var ast = (raw.error || raw.tree) ? raw : this.analyze(raw);
  if (ast.error) {
    cb(ast.error);
    return cb.promise;
  }
  raw = ast.raw;

  // build entries according to codecs
  var entries = [], entry;
  _.forEach(ast.tree, function (node) {
    var codec = findCodec(node);
    if (codec) {
      if (!entry || codec.name !== entry.type) {
        entry = {type: codec.name, codec: codec, nodes: []};
        entries.push(entry);
      }
      entry.nodes.push(node);
    }
  });
  ast.entries = entries;

  _.forEach(entries, function (entry) {
    entry.data = entry.codec.decode(raw, entry.nodes);
  });

  cb(null, ast);

  return cb.promise;
};

function findCodec(node) {
  var found = null;
  _.forEach(codecs, function (codec, name) {
    if (!codec) return;
    if (!Array.isArray(codec.commands) || !_.isFunction(codec.decode)) return;
    if (codec.commands.indexOf(node.ascii + (node.fn || '')) >= 0) {
      found = codec;
      found.name = found.name || name;
      return false;
    }
  });

  return found;
}

function createUnknownDirectiveError(data, offset) {
  return new Error(util.format('Can not parse commands - [%s %s] <(%d/%d) %s>',
    ascii[data[offset]],
    ascii[data[offset + 1]] || '?',
    offset,
    data.length,
    hex(data.slice(offset, Math.min(data.length, offset + 10))))
  );
}

function hex(data, separator) {
  data = _.isArrayLike(data) ? data : [data];
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

/**
 * Expose.
 */

module.exports = Parser;
