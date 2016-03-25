var _ = require('lodash');
var iconv = require('iconv-lite');
var MutableBuffer = require('mutable-buffer').MutableBuffer;
var commands = require('./commands');

module.exports = Printer;

function Printer(connector) {
  if (!(this instanceof Printer)) {
    return new Printer(connector);
  }
  this.connector = connector;
  this.buffer = new MutableBuffer();
}

Printer.prototype.flush = function (cb) {
  var buf = this.buffer.flush();
  if (this.connector) {
    this.connector.write(buf, cb);
  }
  return buf;
};

Printer.prototype.hwinit = function () {
  this.buffer.write(commands.HARDWARE.HW_INIT);
  return this;
};

Printer.prototype.hwselect = function () {
  this.buffer.write(commands.HARDWARE.HW_SELECT);
  return this;
};

Printer.prototype.hwreset = function () {
  this.buffer.write(commands.HARDWARE.HW_RESET);
  return this;
};

/**
 *
 * @param content
 * @param encoding
 * @returns {Printer}
 */
Printer.prototype.print = function (content, encoding) {
  this.buffer.write(iconv.encode(content, encoding || 'GB18030'));
  return this;
};

/**
 *
 * @param content
 * @param encoding
 * @returns {Printer}
 */
Printer.prototype.println = function (content, encoding) {
  this.print([content, commands.EOL].join(''), encoding);
  return this;
};

/**
 *
 * @param content
 * @param encoding
 * @returns {Printer}
 */
Printer.prototype.text = function (content, encoding) {
  this.println(content, encoding);
  return this;
};

Printer.prototype.lineSpace = function (n) {
  if (n === undefined || n === null) {
    this.buffer.write(commands.LINE_SPACING.LS_DEFAULT);
  } else {
    this.buffer.write(commands.LINE_SPACING.LS_SET);
    this.buffer.writeUInt8(n);
  }
  return this;
};


/**
 * Feed n lines
 *
 * @param n
 * @returns {Printer}
 */
Printer.prototype.feed = function (n) {
  this.buffer.write(_.repeat(commands.EOL, n || 1));
  return this;
};

/**
 *
 * @param ctrl
 * @returns {Printer}
 */
Printer.prototype.control = function (ctrl) {
  this.buffer.write(commands.FEED_CONTROL_SEQUENCES[
  'CTL_' + ctrl.toUpperCase()
    ]);
  return this;
};

/**
 *
 * @param align
 * @returns {Printer}
 */
Printer.prototype.align = function (align) {
  this.buffer.write(commands.TEXT_FORMAT[
  'TXT_ALIGN_' + align.toUpperCase()
    ]);
  return this;
};

/**
 *
 * @param family
 * @returns {Printer}
 */
Printer.prototype.font = function (family) {
  this.buffer.write(commands.TEXT_FORMAT[
  'TXT_FONT_' + family.toUpperCase()
    ]);
  return this;
};

/**
 *
 * @param {String} [type]
 *  B, U, U2, BU, BU2, NORMAL
 * @returns {Printer}
 */
Printer.prototype.style = function (type) {
  switch (type.toUpperCase()) {
    case 'B':
      this.buffer.write(commands.TEXT_FORMAT.TXT_UNDERL_OFF);
      this.buffer.write(commands.TEXT_FORMAT.TXT_BOLD_ON);
      break;
    case 'U':
      this.buffer.write(commands.TEXT_FORMAT.TXT_BOLD_OFF);
      this.buffer.write(commands.TEXT_FORMAT.TXT_UNDERL_ON);
      break;
    case 'U2':
      this.buffer.write(commands.TEXT_FORMAT.TXT_BOLD_OFF);
      this.buffer.write(commands.TEXT_FORMAT.TXT_UNDERL2_ON);
      break;
    case 'BU':
      this.buffer.write(commands.TEXT_FORMAT.TXT_BOLD_ON);
      this.buffer.write(commands.TEXT_FORMAT.TXT_UNDERL_ON);
      break;
    case 'BU2':
      this.buffer.write(commands.TEXT_FORMAT.TXT_BOLD_ON);
      this.buffer.write(commands.TEXT_FORMAT.TXT_UNDERL2_ON);
      break;
    case 'NORMAL':
    default:
      this.buffer.write(commands.TEXT_FORMAT.TXT_BOLD_OFF);
      this.buffer.write(commands.TEXT_FORMAT.TXT_UNDERL_OFF);
      break;
  }
  return this;
};

/**
 *
 * @param {Number} [width]
 * @param {Number} [height]
 * @returns {Printer}
 */
Printer.prototype.size = function (width, height) {
  // DEFAULT SIZE: NORMAL
  this.buffer.write(commands.TEXT_FORMAT.TXT_NORMAL);
  if (width == 2) {
    this.buffer.write(commands.TEXT_FORMAT.TXT_2WIDTH);
  }
  if (height == 2) {
    this.buffer.write(commands.TEXT_FORMAT.TXT_2HEIGHT);
  }
  return this;
};

/**
 *
 * @param hw
 * @returns {Printer}
 */
Printer.prototype.hardware = function (hw) {
  this.buffer.write(commands.HARDWARE['HW_' + hw]);
  return this;
};

/**
 *
 * @param code
 * @param type
 * @param width
 * @param height
 * @param position
 * @param font
 * @returns {Printer}
 */
Printer.prototype.barcode = function (code, type, width, height, position, font) {
  if (width >= 1 || width <= 255) {
    this.buffer.write(commands.BARCODE_FORMAT.BARCODE_WIDTH);
  }
  if (height >= 2 || height <= 6) {
    this.buffer.write(commands.BARCODE_FORMAT.BARCODE_HEIGHT);
  }
  this.buffer.write(commands.BARCODE_FORMAT[
  'BARCODE_FONT_' + (font || 'A').toUpperCase()
    ]);
  this.buffer.write(commands.BARCODE_FORMAT[
  'BARCODE_TXT_' + (position || 'BLW').toUpperCase()
    ]);
  this.buffer.write(commands.BARCODE_FORMAT[
  'BARCODE_' + ((type || 'EAN13').replace('-', '_').toUpperCase())
    ]);
  this.buffer.write(code);
  return this;
};

/**
 *
 * @param code
 * @param version
 * @param level
 * @param size
 * @returns {Printer}
 */
Printer.prototype.qrcode = function (code, version, level, size) {
  this.buffer.write(commands.CODE2D_FORMAT.TYPE_QR);
  this.buffer.write(commands.CODE2D_FORMAT.CODE2D);
  this.buffer.writeUInt8(version || 3);
  this.buffer.write(commands.CODE2D_FORMAT[
  'QR_LEVEL_' + (level || 'L').toUpperCase()
    ]);
  this.buffer.writeUInt8(size || 6);
  this.buffer.writeUInt16LE(code.length);
  this.buffer.write(code);
  return this;
};

/**
 *
 * @param {Number} [pin]
 * @returns {Printer}
 */
Printer.prototype.cashdraw = function (pin) {
  this.buffer.write(commands.CASH_DRAWER[
  'CD_KICK_' + (pin || 2)
    ]);
  return this;
};

/**
 *
 * @param {Boolean} [part]
 * @returns {Printer}
 */
Printer.prototype.cut = function (part) {
  this.print(_.repeat(commands.EOL, 3));
  this.buffer.write(commands.PAPER[
    part ? 'PAPER_PART_CUT' : 'PAPER_FULL_CUT'
    ]);
  return this;
};


/**
 *
 * @param {Graphic} graphic
 * @param density
 *  s8  - 8-dot single density
 *  d8  - 8-dot double density
 *  s24 - 24-dot single density
 *  d24 - 24-dot double density
 */
Printer.prototype.bitimage = function (graphic, density) {
  var result, header, n;

  density = density || 'd24';
  header = commands.BITMAP_FORMAT['BITMAP_' + density.toUpperCase()];
  n = density === 's8' || density === 'd8' ? 1 : 3;
  result = graphic.encode('bitmap', n * 8);

  var that = this;
// set line spacing to 0
  this.lineSpace(0);
  _.forEach(result.data, function (line) {
    that.buffer.write(header);
    that.buffer.writeUInt16LE(line.length / n);
    that.buffer.write(line);
    that.feed();
  });
// restore line spacing to default
  this.lineSpace();

  return this;
};

/**
 *
 * @param graphic
 * @param {String} [mode]
 *  normal
 *  dw
 *  dh
 *  dwdh
 */
Printer.prototype.raster = function (graphic, mode) {
  mode = mode || 'normal';
  if (mode === 'dhdw' || mode === 'dwh' || mode === 'dhw') mode = 'dwdh';
  var raster = graphic.encode('raster');
  var header = commands.GSV0_FORMAT['GSV0_' + mode.toUpperCase()];
  this.buffer.write(header);
  this.buffer.writeUInt16LE(raster.width);
  this.buffer.writeUInt16LE(raster.height);
  this.buffer.write(raster.data);
  return this;
};

