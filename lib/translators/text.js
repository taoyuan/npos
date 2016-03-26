"use strict";

var iconv = require('iconv-lite');

module.exports = function () {
  return function text(ctx) { // text decode
    if (ctx.node.type === 'text' && ctx.node.data) {
      ctx.text = ctx.text || '';
      ctx.text += iconv.decode(ctx.node.data, ctx.options.encoding || 'GB2312');
      ctx.end();
    }
  }
};
