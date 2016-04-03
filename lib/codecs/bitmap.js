"use strict";

exports.encode = function (image, density) {
  density = density || 24;

  var line, result = [];
  var x, y, b, l, i;
  var width = image.width;
  var height = image.height;
  var c = density / 8;

  // n blocks of lines
  var n = Math.ceil(height / density);

  for (y = 0; y < n; y++) {
    // line data
    line = result[y] = [];

    for (x = 0; x < width; x++) {

      for (b = 0; b < density; b++) {
        i = x * c + (b >> 3);

        if (line[i] === undefined) {
          line[i] = 0;
        }

        l = y * density + b;
        if (l < height) {
          // if (data[l * width + x]) {
          if (image.getPixel(x, l) === 0x00) {
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
