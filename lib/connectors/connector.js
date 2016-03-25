"use strict";

module.exports = require('./connector');

module.exports = Connector;

function Connector() {
  if (!(this instanceof Connector)) {
    return new Connector();
  }
}

Connector.prototype.write = function (data, cb) {
  cb && cb();
};
