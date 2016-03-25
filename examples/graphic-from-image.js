"use strict";

var path = require('path');
var Graphic = require('..').Graphic;

Graphic.fromImage(path.join(__dirname, 'fixtures', 'images', 'tux.png')).then(function(g) {
  console.log(g.renderText());
});
