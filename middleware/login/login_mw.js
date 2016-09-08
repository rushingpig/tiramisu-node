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

function pathFilter (paths, req) {
    let result = false;
    for (let i = 0; i < paths.length; i++) {
        let path = paths[i];
        if (typeof path == 'string') {
            result = (path == req.path);
        } else if (typeof path == 'object') {
            result = path.test(req.path);
        }
        if (result) return result;
    }
    return result;
}

function LoginMiddleware() {
}
/**
 * the filter to make sure the user has been logined
 * @param req
 * @param res
 * @param next
 */
LoginMiddleware.loginFilter = function (req, res, next) {
    if (pathFilter(config.global_paths, req)) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With');
        res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
        if (req.method == 'OPTIONS') { // 针对跨域预检  必须要返回200让预检通过
            return res.status(200).end();
        }
        if (!req.session) {
            req.session = {};
            req.session.user = {data_scopes: []};
        }
        if (!req.session.user) {
            req.session.user = {data_scopes: []};
        }
        return next();
    }
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