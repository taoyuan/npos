'use strict';

var path = require('path');
var nescpos = require('../');

// var device = new nescpos.Console();
var device = new nescpos.USB();
var printer = new nescpos.Printer(device);

device.open(function () {
  nescpos.graphic.fromImage(path.join(__dirname, 'fixtures', 'images', 'tux.png')).then(function (g) {
    printer
      .align('ct')
      .raster(g)
      .raster(g, 'dw')
      .raster(g, 'dh')
      .raster(g, 'dwdh')
      //.feed(6)
      .flush();

  });

});
