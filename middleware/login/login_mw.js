/**
 * @des    : the midddleware for login controller
 * @author : pigo.can
 * @date   : 15/12/9 上午9:24
 * @email  : rushingpig@163.com
 * @version: v1.0
 */
"use strict";
var config = require('../../config');
var res_obj = require('../../util/res_obj');
var systemUtils = require('../../common/SystemUtils');

function LoginMiddleware() {
}
/**
 * the filter to make sure the user has been logined
 * @param req
 * @param res
 * @param next
 */
LoginMiddleware.loginFilter = function (req, res, next) {
    if(config.exclude_paths.indexOf(req.path) !== -1 || /^(\/v1\/i)+.*/.test(req.path)){  //  exclude the login path and Router => "/v1/i/"
        next();
    }else if (!req.session.user) {
        if(req.xhr){
            res.api(res_obj.SESSION_TIME_OUT,null);
        }else{
            systemUtils.commonRender(req,res);
        }
    }else{
        next();
    }
};
/**
 * to config the req session by the config options
 * @param req
 * @param res
 * @param next
 */
LoginMiddleware.sessionFilter = function(req,res,next){
    let session = req.session;
    session.cookie.maxAge = config.session_options.cookieMaxAge;
    session.cookie.expires = config.session_options.expires;
    next();
};
module.exports = LoginMiddleware;