"use strict";

var fs = require('fs');
var path = require('path');
var PDF = require('pdfkit');
var PromiseA = require('bluebird');
var iconv = require('iconv-lite');
var Jimp = require('jimp');

var npos = require('../');

// example codec to show how add custom codecs
// TODO: more codec to decode escpos protocols
npos.codecs.bold = require('./codecs/text-bold');

var parser = npos.parser();
var raw = fs.readFileSync(path.join(__dirname, 'fixtures', 'receipt.bin'));

// prepare pdf instance
var doc = new PDF();
// pipe to pdf file
doc.pipe(fs.createWriteStream('output/receipt.pdf'));

// default formats
var formats = {
  font: 'Times-Roman'
};

// parse raw to ast
parser.parse(raw).then(function (ast) {
  return PromiseA.mapSeries(ast.entries, function (entry) {
    // entry.type is the codec name
    switch (entry.type) {
      case 'text':
        return renderText(doc, entry.data);
      case 'font':
        return renderFont(doc, entry.data);
      case 'bold':
        return renderBold(doc, entry.data);
      case 'raster':
        return renderImage(doc, entry.data);
      // TODO render more esc pos command
      default:
        console.log('[pdf]', 'Unknown entry type:', entry.type);
        break;
    }
  });
}).finally(function () {
  doc.end();
});

function renderText(doc, data) {
  console.log('[pdf] text:', data);
  var font = formats.font;
  if (formats.bold) {
    font += '-Bold';
  }
  doc.font(font);
  doc.text(decode(data));
}

// The fonts just for test. They should be real like physical receipt formats
function renderFont(doc, data) {
  console.log('[pdf] font:', data);
  var font;
  switch (data) {
    case 'A':
      font = 'Times-Roman';
      break;
    case 'B':
      font = 'Courier';
      break;
    default:
      font = 'Times-Roman';
      break;
  }
  formats.font = font;
}

function renderBold(doc, data) {
  console.log('[pdf] bold:', data);
  formats.bold = data;
}

function renderImage(doc, data) {
  return PromiseA.fromCallback(function (cb) {
    Jimp.read(data.toBuffer(), cb);
  }).then(function (image) {
    return PromiseA.fromCallback(function (cb) {
      image.getBuffer(Jimp.MIME_PNG, cb);
    });
  }).then(function (buffer) {
    doc.image(buffer);
  });
}

function decode(data) {
  return iconv.decode(data, 'GB18030');
}
