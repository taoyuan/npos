"use strict";

exports.encode = function (image, density) {
  density = density || 24;

  var ld, result = [];
  var x, y, b, l, i;
  var data = image.data;
  var width = image.width;
  var height = image.height;
  var c = density / 8;

  // n blocks of lines
  var n = Math.ceil(height / density);

  for (y = 0; y < n; y++) {
    // line data
    ld = result[y] = [];

    for (x = 0; x < width; x++) {

      for (b = 0; b < density; b++) {
        i = x * c + (b >> 3);

        if (ld[i] === undefined) {
          ld[i] = 0;
        }

        l = y * density + b;
        if (l < height) {
          if (data[l * width + x]) {
            ld[i] += (0x80 >> (b & 0x7));
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
