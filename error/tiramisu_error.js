/**
 * @des    : the error object for the business of the project
 * @author : pigo.can
 * @date   : 15/12/25 下午3:57
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var util = require('util'),
    resObj = require('../util/res_obj');

function TiramisuError(res_obj,filename,lineNumber){
    this.res_obj = res_obj;
    Error.call(msg,filename,lineNumber);
}
util.inherits(TiramisuError,Error);

TiramisuError.prototype.getMsg = function(){
    return this.msg || 'no msg about the error <tiramisu>';
};
TiramisuError.prototype.getResObj = function(){
    return this.res_obj || resObj.FAIL;
};
module.exports = TiramisuError;

