/**
 * @des    :
 * @author : pigo.can
 * @date   : 15/12/10 上午9:38
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var config = require('../config');

function LogHelper(log4js){
    this.log4js = log4js;
}

LogHelper.prototype.config = function(){
    this.log4js.configure('log4js.json', config.log4js_options);
}

module.exports = LogHelper;
