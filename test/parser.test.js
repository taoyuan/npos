'use strict';

var assert = require('chai').assert;
var Parser = require('../').Parser;

describe('Parser', function () {

  describe('analyze', function () {

    it('should contain error for analyze', function () {
      var parser = new Parser();
      var invalid = new Buffer( [0x1b, 0x40, 0x1b, 0x70, 0x00, 0x32, 0xff, 0x1d, 0xFF]);
      var ast = parser.analyze(invalid);
      assert.ok(ast.raw);
      assert.ok(ast.error);
      assert.notOk(ast.data);
    });
  });

});
