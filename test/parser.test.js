'use strict';

var assert = require('chai').assert;
var fs = require('fs');
var path = require('path');
var npos = require('..');

describe('Parser', function () {

  describe('#analyze', function () {

    it('should contain error for analyze', function () {
      var parser = npos.parser();
      var raw = new Buffer( [0x1b, 0x40, 0x1b, 0x70, 0x00, 0x32, 0xff, 0x1d, 0xFF]);
      var ast = parser.analyze(raw);
      assert.ok(ast.raw);
      assert.ok(ast.error);
      assert.notOk(ast.data);
    });
  });

  describe('#parse', function () {

    it('should parse textual raw data', function () {
      var parser = npos.parser();
      var raw = require('./fixtures/text-1');
      return parser.parse(raw).then(function (context) {
        assert.ok(context);
        assert.ok(context.ast);
        assert.ok(context.options);
      });
    });

    it('should parse raster raw data', function () {
      var parser = npos.parser();
      var raw = fs.readFileSync(path.join(__dirname, 'fixtures', 'raster.bin'));
      parser.parse(raw).then(function (context) {
        assert.ok(context);
        assert.ok(context.ast);
        assert.ok(context.options);
      });

    });
  });

});
