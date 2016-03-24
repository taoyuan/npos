"use strict";

var _ = require('lodash');
var MutableBuffer = require('mutable-buffer').MutableBuffer;
var Jimp = require('jimp');

module.exports = ByteImage;

function noop() {
  // no-op
}

/**
 *
 * @param {Array|Buffer|Number|Object} data
 * @param {Number} [width]
 * @param {Number} [height]
 * @param {Object} [options]
 * @returns {ByteImage}
 * @constructor
 */
function ByteImage(data, width, height, options) {
  if (!(this instanceof ByteImage)) {
    return new ByteImage(data, width, height, options);
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

Object.defineProperty(ByteImage.prototype, 'data', {
  get: function () {
    return this.mutable.buffer;
  }
});

ByteImage.prototype.append = function (image) {
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
        val = image.data[x + y * image.width];
      } else {
        val = 0xFF;
      }
      this.mutable.writeUInt8(val);
    }
  }

  this.height += image.height;
  return this;
};

ByteImage.prototype.print = function () {
  for (var y = 0; y < this.height; y++) {
    var line = '';
    for (var x = 0; x < this.width; x++) {
      line += this.data[x + y * this.width] ? '*' : ' ';
    }
    console.log(line);
  }
};

ByteImage.prototype.toJimp = function () {
  var image = new Jimp(this.width, this.height, 0xFFFFFFFF, noop);
  var val;
  for (var y = 0; y < this.height; y++) {
    for (var x = 0; x < this.width; x++) {
      val = this.data[x + y * this.width];
      image.setPixelColor(val > 0 ? 0xFFFFFFFF : 0x000000FF, x, y);
    }
  }
  return image;
};
