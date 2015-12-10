/**
 * @des    : the midddleware for login controller
 * @author : pigo.can
 * @date   : 15/12/9 上午9:24
 * @email  : rushingpig@163.com
 * @version: v1.0
 */
"use strict";
var config = require('../../config');

function LoginMiddleware() {
}
LoginMiddleware.loginFilter = function (req, res, next) {
    if(req.path === '/login'){  //  exclude the login path  TODO 将需要过滤的以数组形式配置在config中,增加灵活性
        next();
    }else if (!req.session.user) {
        res.redirect('/login');
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
