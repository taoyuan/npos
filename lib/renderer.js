var assert = require('assert');
var utils = require('./utils');

exports.render = function (type, image, inverse) {
  type = type || 'text';
  if (!exports[type] || type === 'render') {
    return;
  }
  return exports[type](image, inverse);
};

exports.text = function (image, inverse) {
  assert(image);
  var chalk = utils.tryload('chalk', true);

  var width = image.width;
  var height = image.height;

  var bottom = '▄';
  var both = '█';
  var top = '▀';

  var _b, _t, out = '', _debug = [], row = 0, i, j;
  for (i = 0; i < (height / 2); i++) {
    //console.error('row ',i);
    //_debug[row] = [];
    //_debug[row+1] = [];
    for (j = 0; j < width; j++) {
      //console.log('column ',j);
      var c = ' ';
      _t = 0;
      _b = 0;

      if (image.getPixel(j, row) === 0) {
        _t = 1;
        c = '\033[53m' + top;
      }

      if (row + 1 < height && image.getPixel(j, row + 1) === 0) {
        _b = 1;
        c = chalk.underline(bottom);
      }


      if (_b && _t) {
        c = '\033[53m' + chalk.underline(both);
      }
      //_debug[row].push(_t+'');
      //_debug[row+1].push(_b+'');

      out += c;
    }
    //console.log('advancing bit to ',bit);
    row += 2;
    out += "\n";
  }

  //defaults tp inverse. this makes sense for people with dark terminals.
  return inverse ? out : chalk.inverse(out);
};


exports.qrcode = function (image, inverse) {
  assert(image);
  assert(image.width === image.height, 'image must be a qr image with same width and height');
  var chalk = utils.tryload('chalk', true);

  var width = image.width;
  var height = image.height;

  var bottom = '▄';
  var both = '█';
  var top = '▀';

  // var _debug = [];
  var _b, _t, out = ' ', row = 0, i, j;
  //add one row to out for top framing
  for (i = 0; i < width; ++i) {
    out += " ";
  }
  out += " \n";
  for (i = 0; i < (height / 2); i++) {
    //console.error('row ',i);
    //_debug[row] = [];
    //_debug[row+1] = [];
    out += " ";

    for (j = 0; j < width; j++) {
      //console.log('column ',j);
      var c = ' ';
      _t = 0;
      _b = 0;

      if (image.getPixel(j, row) === 0) { // if (bits[bit]) {
        _t = 1;
        c = '\033[53m' + top;
      }

      if (row + 1 < height && (image.getPixel(j, row + 1) === 0)) {//bits[nextRow]) {
        _b = 1;
        c = chalk.underline(bottom);
      }


      if (_b && _t) {
        c = '\033[53m' + chalk.underline(both);
      }
      //_debug[row].push(_t+'');
      //_debug[row+1].push(_b+'');

      out += c;
    }
    //console.log('advancing bit to ',bit);
    row += 2;
    out += " \n";
  }

  //defaults tp inverse. this makes sense for people with dark terminals.
  return inverse ? out : chalk.inverse(out);
};
