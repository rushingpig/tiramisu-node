/**
 * @des    :
 * @author : pigo.can
 * @date   : 15/12/8 下午2:57
 * @email  : rushingpig@163.com
 * @version: v1.0
 */
"use strict";

var middleware = {};

middleware.passport =  require('./security/mw_passport');
middleware.login = require('./login/mw_login');
middleware.system = require('./system/mw_system');


module.exports = middleware;