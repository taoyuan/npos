# npos [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> A ESC/POS library for node

## Installation

```sh
$ npm install --save npos
```

## Parser

Parse ESC/POS binary buffer.

### parse
```js
var npos = require('npos');
var parser = npos.parser();
var buffer = fs.readFileSync('sample.bin');

parser.parse(buffer).then(function (ast) {
  console.log(ast);
});
```

The `ast` form `parse` is like: 

```
{
  raw: <Buffer ...>,
  error: <error>,
  tree: [
    {
      code: 27,         // command code in decimal 
      hex: '1B',        // command code in hex
      ascii: 'ESC',     // command code in ascii name
      offset: 0,        // data offset from buffer
      length: 2,        // data length 
      fn: '@',          // command fn charater
    },
    ....
  ],
  entries: [            // decoded entries
    {
      type: 'raster',
      nodes: [          // nodes handled by codec from ast
      ...
      ],
      data: <Object>    // data decoded by codec
    },
    ...
  ]
}
```

#### rules

`rules` is used to parse esc/pos binary to ast tree.

Example rules:

```js

var npos = require('npos');
var rules = {};

rules[npos.ESC] = {     // 'ESC' commands
  '!': 1,               // 'ESC !' command. Swallow one parameter byte
  '$': 2,           
  '%': 1,
  '&': [0, ycc],        // 'ESC &' command. Using 'ycc' function to decode from offset 0
  '*': [0, 'bitimage'], // 'ESC *' command. Using builtin decoder to decode from offset 0.
  '-': 1,
  '2': 0,
  '3': 1,
  '=': 1,
  '?': 1,
  '@': 0,
  'D': [0, 'escd'],
  'E': 1,
  'G': 1,
  'J': 1,
  'L': 0,
  'M': 1,
  'R': 1,
  'S': 0,
  'T': 1,
  'V': 1,
  'W': 8,
  '\\': 2,
  'a': 1,
  'c': 2,
  'd': 1,
  'p': 3,
  'r': 0, // Select print color
  't': 1,
  '{': 1,
  'B': 2, // Unknown Command
  'Z': [3, 'd16']
};

// Custom splitter with parameter buffer and offset specified with rule.
function ycc(buf, offset) {
  if (buf.length - offset < 3) {
    return buf.length;
  }
  var k = buf[offset + 2] - buf[offset + 1] + 1;
  var num = 3;
  for (var i = 0; i < k; i++) {
    num += buf[offset + num] * buf[offset] + 1;
  }
  return num;
};

```

or extend the builtin rules: 

```js
var npos = require('npos');
npos.rules[npos.ESC]['&'] = [0, ycc];
```

Here are [builtin rules](lib/parser/splitters.js) and [builtin splitters](lib/parser/splitters.js).

#### codec

`npos` use codec to decode from ast tree parsed from binary.

Here are [builtin codecs](lib/codecs/index.js)

We can extend codecs as need. For example: 

```js
// sampleCodec.js

// commands supported
exports.commands = ['GSv0'];   
// decode from raw data and nodes
exports.decode = function (raw, nodes) {  
  // traverse nodes to decode and return result decoded
}
```

```js
var npos = require('npos');
npos.codecs['sampleCodec'] = require('./sampleCodec');
```

### to pdf

See: [example](examples/receipt-to-pdf.js)

## License

© [taoyuan](towyuan@outlook.com)

[npm-image]: https://badge.fury.io/js/npos.svg
[npm-url]: https://npmjs.org/package/npos
[travis-image]: https://travis-ci.org/taoyuan/npos.svg?branch=master
[travis-url]: https://travis-ci.org/taoyuan/npos
[daviddm-image]: https://david-dm.org/taoyuan/npos.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/taoyuan/npos
[coveralls-image]: https://coveralls.io/repos/taoyuan/npos/badge.svg
[coveralls-url]: https://coveralls.io/r/taoyuan/npos
