/**
 * @des    :
 * @author : pigo.can
 * @date   : 15/12/8 下午2:57
 * @email  : rushingpig@163.com
 * @version: v1.0
 */
"use strict";

var middleware = {};

middleware.passport =  require('./security/passport_mw');
middleware.login = require('./login/login_mw');
middleware.system = require('./sys/system_mw');
middleware.db = require('./sys/db_init_mw');
middleware.ajax = require('./ajax/ajax_mw');


module.exports = middleware;