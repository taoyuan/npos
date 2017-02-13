'use strict';

var path = require('path');
var npos = require('../');

var device = new npos.Console();
// var device = new npos.USB();
var printer = new npos.Printer(device);

device.open(function () {
  npos.graphic.fromImage(path.join(__dirname, 'fixtures', 'tux.png')).then(function (g) {
    printer
      .align('ct')
      .bitimage(g, 's8')
      .text('s8')
      .bitimage(g, 'd8')
      .text('d8')
      .bitimage(g, 's24')
      .text('s24')
      .bitimage(g, 'd24')
      .text('d24')
      .feed(6)
      .flush();
  });
});


