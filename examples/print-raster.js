'use strict';

var path = require('path');
var npos = require('../');

// var device = new npos.Console();
var device = new npos.USB();
var printer = new npos.Printer(device);

device.open(function () {
  npos.graphic.fromImage(path.join(__dirname, 'fixtures', 'tux.png')).then(function (g) {
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
