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
    if(req.path === '/login'){
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
    console.log('heihei...........',session);
};
module.exports = LoginMiddleware;
