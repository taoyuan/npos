"use strict";

var _ = require('lodash');
var Promise = require('bluebird');
var iconv = require('iconv-lite');

var tess;

module.exports = textualize;

function textualize(ast, options) {
  var entries = Array.isArray(ast) ? ast : ast.entries;

  options = _.merge({
    text: {
      encoding: 'GB18030'
    },
    ocr: {
      psm: 6,
      segline: true
    }
  }, options);

  return Promise.map(entries, function (entry) {
    return new Promise(function (resolve, reject) {
      switch (entry.type) {
        case 'text':
          console.log('[textualize] text');
          resolve(decode(entry.data, options.text));
          break;
        case 'raster':
          if (options.ocr) {
            console.log('[textualize] raster (ocr)');
            tess = tess || require('tessocr').tess();
            tess.ocr(entry.data, options.ocr, function (err, text) {
              if (err) return reject(err);
              resolve(text);
            });
          }
          break;
        default:
          console.log('[WARN]', 'Unknown entry type:', entry.type);
          resolve(entry.data || '');
          break;
      }
    }).then(legalize); // get rid of illegal characters
  });
}

function decode(data, options) {
  return iconv.decode(data, options.encoding);
}

function legalize(text) {
  return text && text.replace(/\u0000/g, '');
}
