"use strict";

var _ = require('lodash');
var Promise = require('bluebird');
var lwim = require('lwim');
var codecs = require('./codecs');
var renderer = require('./renderer');
var utils = require('./utils');

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
  var Jimp = utils.tryload('jimp', true);
  return new Promise(function (resolve, reject) {
    Jimp.read(image, function (err, image) {
      if (err) return reject(err);
      var bitmap = lwim.Bitmap(image.bitmap.width, image.bitmap.height);
      image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
        var red = this.bitmap.data[idx + 0];
        var green = this.bitmap.data[idx + 1];
        var blue = this.bitmap.data[idx + 2];
        var alpha = this.bitmap.data[idx + 3];

        // 0 : white
        // 1 : black
        bitmap.setPixel(x, y, (alpha === 0) || (red > 0x7F && green > 0x7F && blue > 0x7F) ? 0xFF : 0x00);
        // pixes.push((alpha === 0) || (red > 0x7F && green > 0x7F && blue > 0x7F) ? 0 : 1);
      });
      resolve(new Graphic(bitmap));
    });
  });
};

Graphic.qr = Graphic.qrcode = function (text, options) {
  if (typeof options === 'string') {
    options = {level: options}
  } else if (typeof options === 'number') {
    options = {size: options}
  }

  options = _.merge({
    size: 4,
    level: 'M'
  }, options);

  // Module size of the generated QR code (i.e. 1-20).
  var size = options.size >= 1 && options.size <= 20 ? options.size : 4;
  // Actual size of the QR code symbol and is scaled to 25 pixels (e.g. 1 = 25px, 3 = 75px).
  size *= 25;

  var qr = require('qr-image');
  var matrix = qr.matrix(text, options);
  var width = matrix.length;

  // Determine the *pixel* size.
  var px = size;
  px /= width;
  px  = Math.floor(px);

  var offset = Math.floor((size - (px * width)) / 2);

  // Draw the QR code.
  var image = new lwim.Bitmap(size, size);

  var i, j;

  for (i = 0; i < width; i++) {
    for (j = 0; j < width; j++) {
      if (matrix[i][j]) {
        image.drawFilledRect(px * i + offset, px * j + offset, px, px, 0, 0);
      }
    }
  }

  return Promise.resolve(new Graphic(image));
};

Graphic.render = function (image, type) {
  return renderer.render(type, image);
};

Graphic.prototype.encode = function (type, options) {
  if (!codecs[type] || !codecs[type].encode) {
    throw new Error('Unknown codec type: ' + type);
  }

  return codecs[type].encode(this.image, options);
};

Graphic.prototype.render = function (type) {
  return renderer.render(type, this.image);
};
