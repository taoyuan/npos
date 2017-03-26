'use strict';

var assert = require('chai').assert;
var fs = require('fs');
var path = require('path');
var s = require('../support');
var npos = require('../..');

describe('codec/character-code-table', function () {

  it('should decode character code table command', function () {
    var parser = npos.parser();
    var raw = fs.readFileSync(s.fixtures('bins/escposbin_ESCtn_commands.bin'));
    return parser.parse(raw).then(function (ast) {
      var entries = ast.entries.filter(function(entry) {
        return entry.type === 'character-code-table';
      });

      // entries.forEach(function (entry) {
      //   console.log(entry.data);
      // });

      assert.ok(entries.length);
      assert.equal(entries[0].data, 'PC437');
    });
  });
});
