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

function LoginMiddleware() {
}
LoginMiddleware.loginFilter = function (req, res, next) {
    if(config.exclude_paths.indexOf(req.path) !== -1){  //  exclude the login path
        next();
    }else if (!req.session.user) {
        console.log('==========');
        if(req.xhr){
            res.api(res_obj.SESSION_TIME_OUT,null);
        }else{
            res.render('index');
        }
    }else{
        next();
    }
};

LoginMiddleware.sessionFilter = function(req,res,next){
    let session = req.session;
    session.cookie.maxAge = config.session_options.cookieMaxAge;
    session.cookie.expires = config.session_options.expires;
    next();
};
module.exports = LoginMiddleware;
