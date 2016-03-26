"use strict";

var BitImage = require('../bitimage');

exports.commands = ['GSv0'];

exports.encode = function (image) {
  var data = [];
  var x, y, b, c, i;

  // n blocks of lines
  var width = Math.ceil(image.width / 8);

  for (y = 0; y < image.height; y++) {
    for (x = 0; x < width; x++) {
      for (b = 0; b < 8; b++) {
        i = x * 8 + b;

        if (data[y * width + x] === undefined) {
          data[y * width + x] = 0;
        }

        c = x * 8 + b;
        if (c < image.width) {
          if (image.data[y * image.width + i]) {
            data[y * width + x] += (0x80 >> (b & 0x7));
          }
        }
      }
    }
  }
  return {
    data: data,
    width: width,
    height: image.height
  };
};

exports.decode = function (raw, offset) {
  if (raw && typeof raw === 'object' && raw.raw) {
    offset = raw.offset;
    raw = raw.raw;
  }

  if (!raw || !raw.length) {
    return;
  }

  offset = offset || 0;

  while (offset < raw.length && !test(raw, offset)) {
    offset++;
  }
  if (offset >= raw.length) {
    return;
  }

  offset += 4;

  var width, height;
  width = raw[offset + 1] * 256 + raw[offset];
  offset += 2;
  height = raw[offset + 1] * 256 + raw[offset];
  offset += 2;
  var size = width * height;
  var buf = new Buffer(size * 8);

  for (var i = 0; i < size; i++) {
    for (var j = 0; j < 8; j++) {
      var bit = (raw[offset + i] >> (7 - j)) & 0x01;
      buf.writeUInt8(bit, i * 8 + j);
    }
  }

  return new BitImage(buf, width * 8, height, {
    raw: raw,
    offset: offset
  });
};

exports.test = function (raw, offset) {
  if (raw && typeof raw === 'object' && raw.raw) {
    offset = raw.offset;
    raw = raw.data;
  }

  if (!raw || !raw.length) {
    return;
  }

  return test(raw, offset)
};

function test(data, offset) {
  offset = offset || 0;
  if (data[offset] === 0x1D && data[offset + 1] === 0x76 && data[offset + 2] === 0x30) {
    return 3;
  }
  return 0;
}

