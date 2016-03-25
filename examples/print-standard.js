'use strict';

var escpos = require('../');

// var device = new escpos.Console();
var device = new escpos.USB();
var printer = new escpos.Printer(device);

device.open(function () {
  printer
    .font('C')
    .align('lt')
    .style('bu')
    .size()
    .text('The quick brown fox jumps over the lazy dog')
    .text('敏捷的棕色狐狸跳过懒狗')
    .barcode('12345678', 'EAN8')
    .feed()
    .cut()
    .flush();

});

process.on('SIGINT', exit());
process.on('SIGTERM', exit());

function exit() {
  return function () {
    console.log('Stopping and halting ...');
    device.close();
    setTimeout(process.exit, 1000);
  }
}
