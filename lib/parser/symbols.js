'use strict';

exports.STX = 0x02; // text
exports.DLE = 0x10;
exports.ESC = 0x1B;
exports.FS = 0x1C;
exports.GS = 0x1D;

exports.CAN = 0x18;
exports.FF = 0x0C;
exports.SP = 0x20;

exports.C_EOT = String.fromCharCode(0x04);
exports.C_END = String.fromCharCode(0x05);
exports.C_DC4 = String.fromCharCode(0x14);
exports.C_FF = String.fromCharCode(0x0C);
exports.C_SP = String.fromCharCode(0x20);


exports.C_DC41 = exports.C_DC4 + '1';
exports.C_DC42 = exports.C_DC4 + '2';
exports.C_DC48 = exports.C_DC4 + '8';
