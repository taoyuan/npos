"use strict";

var _ = require('lodash');
var MutableBuffer = require('mutable-buffer').MutableBuffer;
var Jimp = require('jimp');
var renderer = require('./renderer');

module.exports = BitImage;

function noop() {
  // no-op
}

/**
 *
 * @param {Array|Buffer|Number|Object} data
 * @param {Number} [width]
 * @param {Number} [height]
 * @param {Object} [options]
 * @returns {BitImage}
 * @constructor
 */
function BitImage(data, width, height, options) {
  if (!(this instanceof BitImage)) {
    return new BitImage(data, width, height, options);
  }

  if (_.isNumber(data)) {
    height = width;
    width = data;
    data = null;
  }

  if (data && data.data) {
    width = width || data.width;
    height = height || data.height;
    data = data.data;
  }

  height = height || 0;

  this.width = width;
  this.height = height;
  this.mutable = new MutableBuffer();
  if (data) {
    this.mutable.write(data);
  }

  _.assign(this, options);
}

Object.defineProperty(BitImage.prototype, 'data', {
  get: function () {
    return this.mutable.buffer;
  }
});

BitImage.prototype.append = function (image) {
  if (!image || !image.data || !image.width || !image.height) {
    return this;
  }

  if (!this.width) {
    this.width = image.width;
  }

  var val;
  for (var y = 0; y < image.height; y++) {
    for (var x = 0; x < this.width; x++) {
      if (x < image.width) {
        val = image.data[x + y * image.width] > 0 ? 1 : 0;
      } else {
        val = 0;
      }
      this.mutable.writeUInt8(val);
    }
  }

  this.height += image.height;
  return this;
};

BitImage.prototype.render = function (type) {
  type = type || 'text';
  if (!renderer[type]) throw new Error('Unknown renderer: ' + type);
  return renderer[type](this.data, this.width, this.height);
};

BitImage.prototype.toJimp = function () {
  var image = new Jimp(this.width, this.height, 0xFFFFFFFF, noop);
  var val;
  for (var y = 0; y < this.height; y++) {
    for (var x = 0; x < this.width; x++) {
      val = this.data[x + y * this.width];
      image.setPixelColor(val > 0 ? 0x000000FF : 0xFFFFFFFF, x, y);
    }
  }
  return image;
};
