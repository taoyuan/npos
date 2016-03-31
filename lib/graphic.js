"use strict";

var _ = require('lodash');
var Promise = require('bluebird');
var Jimp = require('jimp');
var qr = require('qr-image');
var BitImage = require('./bitimage');
var codecs = require('./codecs');

module.exports = Graphic;

/**
 *
 * @param image
 * @constructor
 */
function Graphic(image) {
  if (!(this instanceof Graphic)) {
    return new Graphic(image);
  }
  this.image = image;
}

Graphic.fromImage = function (image) {
  return new Promise(function (resolve, reject) {
    Jimp.read(image, function (err, image) {
      if (err) return reject(err);
      var pixes = [];
      image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
        var red   = this.bitmap.data[ idx + 0 ];
        var green = this.bitmap.data[ idx + 1 ];
        var blue  = this.bitmap.data[ idx + 2 ];
        var alpha = this.bitmap.data[ idx + 3 ];

        // 0 : white
        // 1 : black
        pixes.push((alpha === 0) || (red > 0x7F && green > 0x7F && blue > 0x7F) ? 0 : 1);
      });
      resolve(new Graphic(new BitImage(pixes, image.bitmap.width, image.bitmap.height)));
    });
  });
};

Graphic.qrcode = function (text, level) {
  var matrix = qr.matrix(text, level);
  var bits = [], N = matrix.length;
  for (var i = 0; i < N; i++) {
    for (var j = 0; j < N; j++) {
      bits[j + i * N] = matrix[i][j];
    }
  }
  return Promise.resolve(new Graphic(new BitImage(bits, N, N)));
};

Graphic.prototype.encode = function (type, options) {
  if (!codecs[type] || !codecs[type].encode) {
    throw new Error('Unknown codec type: ' + type);
  }

  return codecs[type].encode(this.image, options);
};

Graphic.prototype.render = function (type) {
  return this.image.render(type);
};
