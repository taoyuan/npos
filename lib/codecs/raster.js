"use strict";

var _ = require('lodash');
var lwim = require('lwim');

var MAX_WIDTH = 1024;
var MAX_HEIGTH = 10240;

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
          // if (image.data[y * image.width + i]) {
          if (image.getPixel(i, y) === 0x00) {
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


exports.decode = function (raw, nodes, image) {
  if (nodes && typeof nodes === 'object' && nodes.setPixel) {
    image = nodes;
    nodes = null;
  }
  if (!nodes) nodes = [{offset: 0}];
  if (!Array.isArray(nodes)) {
    nodes = [nodes];
  }

  if (!image) {
    var width = 0, height = 0;
    // calc max width and max height
    _.forEach(nodes, function (node) {
      if (!node.width && !node.height) {
        var offset = node.offset;

        while (offset < raw.length && !test(raw, offset)) {
          offset++;
        }
        if (offset >= raw.length) {
          return;
        }

        offset += 4;

        node.width = raw[offset + 1] * 256 + raw[offset];
        offset += 2;
        node.height = raw[offset + 1] * 256 + raw[offset];
        offset += 2;
        node.offset = offset;
        node.size = node.width * node.height;
        // calc image real width according to esc/pos raster protocol
        node.width <<= 3;
      }

      if (node.width > MAX_WIDTH) {
        node.error = 'Out of bounds with width';
        console.warn('Image is out of bounds with width. max is %d, real is %d', MAX_WIDTH, node.width);
      }

      if (node.height > MAX_HEIGTH) {
        node.error = 'Out of bounds with height';
        console.warn('Image is out of bounds with height. max is %d, real is %d', MAX_WIDTH, node.height);
      }


      width = Math.max(node.width, width);
      height += node.height;
    });

    image = new lwim.Bitmap(width, height);
  }

  var line = 0;
  _.forEach(nodes, function (node) {
    if (node.error) return;

    var offset = node.offset;
    var pbyte, pbit, val;
    for (var y = 0; y < node.height; y++, line++) {
      for (var x = 0; x < node.width; x++) {
        pbyte = (y * width + x) >> 3;
        pbit = x & 0x7; // low 3 bits
        val = (raw[offset + pbyte] >> (7 - pbit)) & 0x01;
        image.setPixel(x, line, val ? 0 : 0xFF); // mark dark for dot
      }
    }

  });

  return image;
};

// exports.decode = function (raw, offset) {
//   if (raw && typeof raw === 'object' && raw.raw) {
//     offset = raw.offset;
//     raw = raw.raw;
//   }
//
//   if (!raw || !raw.length) {
//     return;
//   }
//
//   offset = offset || 0;
//
//   while (offset < raw.length && !test(raw, offset)) {
//     offset++;
//   }
//   if (offset >= raw.length) {
//     return;
//   }
//
//   offset += 4;
//
//   var width, height;
//   width = raw[offset + 1] * 256 + raw[offset];
//   offset += 2;
//   height = raw[offset + 1] * 256 + raw[offset];
//   offset += 2;
//   var size = width * height;
//   var buf = new Buffer(size * 8);
//
//   for (var i = 0; i < size; i++) {
//     for (var j = 0; j < 8; j++) {
//       var bit = (raw[offset + i] >> (7 - j)) & 0x01;
//       buf.writeUInt8(bit, i * 8 + j);
//     }
//   }
//
//   return new BitImage(buf, width * 8, height, {
//     raw: raw,
//     offset: offset
//   });
// };

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

