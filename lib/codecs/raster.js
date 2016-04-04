"use strict";

var _ = require('lodash');
var lwim = require('lwim');

var MAX_WIDTH = 1024;
var MAX_HEIGTH = 10240;

exports.commands = ['GSv0'];

exports.encode = function (image, rect) {
  var data = [];
  var x, y, b, c, i;

  rect = rect || [0, 0, image.width, image.height];
  // left
  var rl = rect[0];
  // top
  var rt = rect[1];
  var rw = rect[2];
  var rh = rect[3];

  if (rl < 0) rl = 0;
  if (rl >= image.width) rl = image.width - 1;
  if (rt < 0) rt = 0;
  if (rt > image.height) rt = image.height - 1;

  rw = Math.min(rw, image.width - rl);
  rh = Math.min(rh, image.height - rt);

  var bytesPerLine = Math.ceil(rw / 8);

  for (y = 0; y < rh; y++) {
    for (x = 0; x < bytesPerLine; x++) {
      for (b = 0; b < 8; b++) {
        i = x * 8 + b;

        if (data[y * bytesPerLine + x] === undefined) {
          data[y * bytesPerLine + x] = 0;
        }

        c = x * 8 + b;
        if (c < rw) {
          if (image.getPixel(i + rl, y + rt) === 0x00) {
            data[y * bytesPerLine + x] += (0x80 >> (b & 0x7));
          }
        }
      }
    }
  }
  return {
    data: data,
    width: bytesPerLine,
    height: rh
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

