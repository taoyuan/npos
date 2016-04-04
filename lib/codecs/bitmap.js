"use strict";

exports.encode = function (image, rect, density) {
  if (typeof rect === 'number') {
    density = rect;
    rect = null;
  }

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

  density = density || 24;

  var line, result = [];
  var x, y, b, l, i;
  var c = density / 8;

  // n blocks of lines
  var n = Math.ceil(rh / density);

  for (y = 0; y < n; y++) {
    // line data
    line = result[y] = [];

    for (x = 0; x < rw; x++) {

      for (b = 0; b < density; b++) {
        i = x * c + (b >> 3);

        if (line[i] === undefined) {
          line[i] = 0;
        }

        l = y * density + b;
        if (l < rh) {
          if (image.getPixel(x + rl, l + rt) === 0x00) {
            line[i] += (0x80 >> (b & 0x7));
          }
        }
      }
    }
  }

  return {
    data: result,
    density: density
  };
};
