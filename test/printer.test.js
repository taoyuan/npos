"use strict";

var npos = require('..');

describe('Printer', function () {

  it('should initiate without connector', function (done) {
    var printer = new npos.Printer();
    printer.flush(done);
  });
});
