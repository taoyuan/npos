"use strict";

var _ = require('lodash');
var Promise = require('bluebird');
var tess = require('tessocr').tess();
var iconv = require('iconv-lite');

module.exports = textualize;

function textualize(ast, options) {
  var entries = (ast && ast.entries) || ast;

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
    switch (entry.type) {
      case 'text':
      {
        return decode(entry.data, options.text);
      }
      case 'raster':
      {
        if (options.ocr) {
          console.time('ocr');
          return new Promise(function (resolve, reject) {
            tess.ocr(entry.data, options.ocr, function (err, text) {
              console.timeEnd('ocr');
              if (err) return reject(err);
              resolve(text);
            });
          });
        }
        break;
      }
      default:
        console.log('[WARN]', 'Unknown entry type:', entry.type);
        break;
    }
    return entry.data;
  });
}

function decode(data, options) {
  return iconv.decode(data, options.encoding);
}
