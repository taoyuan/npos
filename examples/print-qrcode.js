"use strict";

var npos = require('..');

// var device = new npos.Console();
var device = new npos.USB();
var printer = new npos.Printer(device);

var text = '西游记告诉我们：凡是有后台的妖怪都被接走了，凡是没后台的都被一棒子打死了。';

device.open(function () {
  npos.graphic.qrcode(text, {level: 'H', size: 12}).then(function (g) {
    printer
      .align('ct')
      .bitimage(g)
      .raster(g)
      .feed(4)
      .flush();
  });
});
