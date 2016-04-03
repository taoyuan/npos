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
          assert.lengthOf(results, 1);
        });
      });
    });

});
