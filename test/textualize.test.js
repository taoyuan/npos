'use strict';

var assert = require('chai').assert;
var fs = require('fs');
var path = require('path');
var s = require('./support');
var npos = require('..');

describe('textualize', function () {
  it('should parse raster raw data', function () {
    this.timeout(5000);
    var parser = npos.parser();
    var raw = fs.readFileSync(path.join(__dirname, 'fixtures', 'raster-2.bin'));
    return parser.parse(raw).then(function (ast) {
      assert.ok(ast);
      return npos.textualize(ast, {
        ocr: {
          tessdata: s.fixtures('tessdata'),
          language: 'pos.chs.fast'
        }
      }).then(function (results) {
        assert.ok(results.length);
        assert.include(results[0], '金额');
      });
    });
  });

  it('should get rid of illegal characters', function () {
    return npos.textualize([{
      type: 'text',
      data: new Buffer('h\u0000el\u0000lo\u0000 \u0000worl\u0000\u0000\u0000d')
    }]).then(function (results) {
      assert.ok(results.length);
      assert.equal(results[0], 'hello world');
    });
  });

});
