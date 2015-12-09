/**
 * @des    : the config for dev environment
 * @author : pigo.can
 * @date   : 15/12/2 上午10:03
 * @email  : rushingpig@163.com
 * @version: v1.0
 */
"use strict";
//  express static config options
var exp_static_options = {
    dotfiles: "ignore",
    etag: true,
    extensions: false,
    index: "index.html",
    lastModified: true,
    maxAge:0,
    redirect:true,
    setHeaders:null
};
//  express session config options
var exp_session_options = {
    secret : 'tiramisu cake',
    resave : false,
    saveUninitialized : true,
    cookie : {
        secure : false,
        maxAge : 1000000,
        expires : false     //Date.now + 1000000
    }
};
//  express router config options
var exp_router_options = {
    caseSensitive:false,
    mergeParams:false,
    strict:false
};
//  session lifecycle
//  TODO add this property to current object
var session_options = function(){
    let baseTime = 10000;
    return {
        baseTime : baseTime,
        cookieMaxAge : baseTime,  //  unit ms
        expires : new Date(Date.now() + baseTime)
    };
};

module .exports = {
    exp_static_options : exp_static_options,
    exp_session_options : exp_session_options,
    exp_router_options : exp_router_options,
};

