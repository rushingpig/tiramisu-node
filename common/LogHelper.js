/**
 * @des    : helper to complete the log4js
 * @author : pigo.can
 * @date   : 15/12/10 上午9:38
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var config = require('../config');

function LogHelper(log4js){
    this.log4js = log4js || require('log4js');
}
/**
 * config the log4js about config filename and some options
 */
LogHelper.prototype.config = function(){
    this.log4js.configure('log4js.json', config.log4js_options);
};
/**
 * <ul>get the specified logger object
 *      <li>the default name of logger is <b>default</b></li>
 *      <li>the default level is <b>INFO</b></li>
 * </ul>
 * @param loggerName
 * @param level
 * @returns {Logger}
 */
LogHelper.prototype.getLogger = function(loggerName,level){
    let logger = this.log4js.getLogger(loggerName || 'default');
    logger.setLevel(level || this.log4js.levels.INFO);
    return logger;
};

module.exports = LogHelper;
