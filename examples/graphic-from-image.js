"use strict";

var path = require('path');
var Graphic = require('..').Graphic;

Graphic.fromImage(path.join(__dirname, 'fixtures', 'tux.png')).then(function(g) {
  console.log(g.render());
});
