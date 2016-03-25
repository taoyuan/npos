"use strict";

var _ = require('lodash');
var Promise = require('bluebird');
var getPixels = Promise.promisify(require('get-pixels'));
var QRCode = require('qrcode');
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

Graphic.fromPixels = function (pixels) {
  var info = pixels_size(pixels);
  var data = _.chunk(pixels.data, info.colors).map(pixels_rgb).map(pixels_dot);
  return Promise.resolve(new Graphic(new BitImage(_.assign({data: data}, info))));
};

Graphic.fromImage = function (url, type) {
  if (type && !_.startsWith(type, 'image/')) {
    type = 'image/' + type;
  }

  return getPixels(url, type).then(function (pixels) {
    return Graphic.fromPixels(pixels);
  });
};

Graphic.qrcode = function (text, options) {
  options = _.assign({}, options);
  return new Promise(function (resolve, reject) {
    QRCode.drawBitArray(text, options, function (err, bits, width) {
      if (err) return reject (err);
      resolve(new Graphic(new BitImage(bits, width, width)));
    });
  });
};

Graphic.prototype.encode = function (type, options) {
  if (!codecs[type] || !codecs[type].encode) {
    throw new Error('Unknown codec type: ' + type);
  }

  return codecs[type].encode(this.image, options);
};

Graphic.prototype.renderText = function () {
  return this.image.renderText();
};

// -----------------
// Graphic Utilities
// -----------------

function pixels_rgb(pixel) {
  return {
    r: pixel[0],
    g: pixel[1],
    b: pixel[2],
    a: pixel[3]
  };
}

function pixels_size(img) {
  return {
    width: img.shape[0],
    height: img.shape[1],
    colors: img.shape[2]
  };
}

function pixels_dot(pixel) {
  // 0 : white
  // 1 : black
  return (pixel.a === 0) || (pixel.r === 0xFF && pixel.g === 0xFF && pixel.b === 0xFF) ? 0 : 1;
}
