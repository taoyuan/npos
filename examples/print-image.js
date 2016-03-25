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
      .bitimage(g, 's8')
      .bitimage(g, 'd8')
      .bitimage(g, 's24')
      .bitimage(g, 'd24')
      //.feed(6)
      .flush();
  });
});


