'use strict';
var util = require('util'),
  resObj = require('../util/res_obj');

function TiramisuError(res_obj, msg, filename, lineNumber) {
  this.res_obj = Object.assign({}, res_obj);
  if (msg) {
    this.res_obj.msg = msg;
  }
  this.msg = msg || res_obj.msg;
  Error.call(msg, filename, lineNumber);
}
util.inherits(TiramisuError, Error);

TiramisuError.prototype.getMsg = function () {
  return this.msg || 'no msg about the error <tiramisu>';
};
TiramisuError.prototype.getResObj = function () {
  return this.res_obj || resObj.FAIL;
};
module.exports = TiramisuError;

