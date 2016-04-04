var _ = require('lodash');
var iconv = require('iconv-lite');
var MutableBuffer = require('mutable-buffer').MutableBuffer;
var commands = require('./commands');
var utils = require('./utils');

module.exports = Printer;

/**
 *
 * @param [conn]
 * @returns {Printer}
 * @constructor
 */
function Printer(conn) {
  if (!(this instanceof Printer)) {
    return new Printer(conn);
  }

  if (conn) {
    if (typeof conn === 'function') {
      this._write = function (data, cb) {
        return conn(data, cb);
      }
    } else {
      var write = conn.write || conn.send;
      if (write) {
        this._write = function (data, cb) {
          return write.call(conn, data, cb);
        }
      }
    }
  }

  if (!this._write) {
    this._write = function (data, cb) {
      return cb && cb();
    }
  }

  this._buffer = new MutableBuffer();
}

Object.defineProperty(Printer.prototype, 'buffer', {
  get: function () {
    return this._buffer;
  }
});

Printer.prototype.flush = function (cb) {
  var buf = this._buffer.flush();
  this._write(buf, cb);
  return buf;
};

Printer.prototype.hwinit = function () {
  this._buffer.write(commands.HARDWARE.HW_INIT);
  return this;
};

Printer.prototype.hwselect = function () {
  this._buffer.write(commands.HARDWARE.HW_SELECT);
  return this;
};

Printer.prototype.hwreset = function () {
  this._buffer.write(commands.HARDWARE.HW_RESET);
  return this;
};

/**
 *
 * @param content
 * @param encoding
 * @returns {Printer}
 */
Printer.prototype.print = function (content, encoding) {
  this._buffer.write(iconv.encode(content, encoding || 'GB18030'));
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
    this._buffer.write(commands.LINE_SPACING.LS_DEFAULT);
  } else {
    this._buffer.write(commands.LINE_SPACING.LS_SET);
    this._buffer.writeUInt8(n);
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
  this._buffer.write(_.repeat(commands.EOL, n || 1));
  return this;
};

/**
 *
 * @param ctrl
 * @returns {Printer}
 */
Printer.prototype.control = function (ctrl) {
  this._buffer.write(commands.FEED_CONTROL_SEQUENCES[
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
  this._buffer.write(commands.TEXT_FORMAT[
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
  this._buffer.write(commands.TEXT_FORMAT[
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
      this._buffer.write(commands.TEXT_FORMAT.TXT_UNDERL_OFF);
      this._buffer.write(commands.TEXT_FORMAT.TXT_BOLD_ON);
      break;
    case 'U':
      this._buffer.write(commands.TEXT_FORMAT.TXT_BOLD_OFF);
      this._buffer.write(commands.TEXT_FORMAT.TXT_UNDERL_ON);
      break;
    case 'U2':
      this._buffer.write(commands.TEXT_FORMAT.TXT_BOLD_OFF);
      this._buffer.write(commands.TEXT_FORMAT.TXT_UNDERL2_ON);
      break;
    case 'BU':
      this._buffer.write(commands.TEXT_FORMAT.TXT_BOLD_ON);
      this._buffer.write(commands.TEXT_FORMAT.TXT_UNDERL_ON);
      break;
    case 'BU2':
      this._buffer.write(commands.TEXT_FORMAT.TXT_BOLD_ON);
      this._buffer.write(commands.TEXT_FORMAT.TXT_UNDERL2_ON);
      break;
    case 'NORMAL':
    default:
      this._buffer.write(commands.TEXT_FORMAT.TXT_BOLD_OFF);
      this._buffer.write(commands.TEXT_FORMAT.TXT_UNDERL_OFF);
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
  this._buffer.write(commands.TEXT_FORMAT.TXT_NORMAL);
  if (width == 2) {
    this._buffer.write(commands.TEXT_FORMAT.TXT_2WIDTH);
  }
  if (height == 2) {
    this._buffer.write(commands.TEXT_FORMAT.TXT_2HEIGHT);
  }
  return this;
};

/**
 *
 * @param hw
 * @returns {Printer}
 */
Printer.prototype.hardware = function (hw) {
  this._buffer.write(commands.HARDWARE['HW_' + hw]);
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
    this._buffer.write(commands.BARCODE_FORMAT.BARCODE_WIDTH);
  }
  if (height >= 2 || height <= 6) {
    this._buffer.write(commands.BARCODE_FORMAT.BARCODE_HEIGHT);
  }
  this._buffer.write(commands.BARCODE_FORMAT[
  'BARCODE_FONT_' + (font || 'A').toUpperCase()
    ]);
  this._buffer.write(commands.BARCODE_FORMAT[
  'BARCODE_TXT_' + (position || 'BLW').toUpperCase()
    ]);
  this._buffer.write(commands.BARCODE_FORMAT[
  'BARCODE_' + ((type || 'EAN13').replace('-', '_').toUpperCase())
    ]);
  this._buffer.write(code);
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
  this._buffer.write(commands.CODE2D_FORMAT.TYPE_QR);
  this._buffer.write(commands.CODE2D_FORMAT.CODE2D);
  this._buffer.writeUInt8(version || 3);
  this._buffer.write(commands.CODE2D_FORMAT[
  'QR_LEVEL_' + (level || 'L').toUpperCase()
    ]);
  this._buffer.writeUInt8(size || 6);
  this._buffer.writeUInt16LE(code.length);
  this._buffer.write(code);
  return this;
};

/**
 *
 * @param {Number} [pin]
 * @returns {Printer}
 */
Printer.prototype.cashdraw = function (pin) {
  this._buffer.write(commands.CASH_DRAWER[
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
  this._buffer.write(commands.PAPER[
    part ? 'PAPER_PART_CUT' : 'PAPER_FULL_CUT'
    ]);
  return this;
};


/**
 *
 * @param {Graphic} graphic
 * @param {Object|String} [options]
 * @param {String} [options.density]
 *
 *  s8  - 8-dot single density
 *  d8  - 8-dot double density
 *  s24 - 24-dot single density
 *  d24 - 24-dot double density
 */
Printer.prototype.bitimage = function (graphic, options) {
  if (typeof options === 'string') {
    options = {density: options};
  } 
  options = options || {};

  var density = options.density || 'd24';
  var header = commands.BITMAP_FORMAT['BITMAP_' + density.toUpperCase()];
  var n = density === 's8' || density === 'd8' ? 1 : 3;
  var result = graphic.encode('bitmap', n * 8);

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
 * @param {Object|String|Number} [options]
 * @param {String} [options.mode]
 * @param {String} [options.block] lines block to print. default is 24. 0 for no block
 *  normal
 *  dw
 *  dh
 *  dwdh
 */
Printer.prototype.raster = function (graphic, options) {
  if (typeof options === 'string') {
    options = {mode: options};
  } else if (typeof options === 'number') {
    options = {block: options};
  }
  options = options || {};
  var mode = options.mode || 'normal';
  if (mode === 'dhdw' || mode === 'dwh' || mode === 'dhw') mode = 'dwdh';
  var block = options.block === 0 ? 0 : (options.block || 24);

  var width = graphic.image.width;
  var height = graphic.image.height;
  if (!block) block = height;
  var n = Math.ceil(height / block);

  var header = commands.GSV0_FORMAT['GSV0_' + mode.toUpperCase()];

  for (var i = 0; i < n; i++) {
    var raster = graphic.encode('raster', [0, i * block, width, block]);
    this._buffer.write(header);
    this._buffer.writeUInt16LE(raster.width);
    this._buffer.writeUInt16LE(raster.height);
    this._buffer.write(raster.data);
  }

  return this;
};

