/**
 * @des    :
 * @author : pigo.can
 * @date   : 16/1/19 下午1:54
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
function AjaxMw(){

}
/**
 * if you want to allow jsonp request,you can use this middleware
 * @param req
 * @param res
 * @param next
 */
AjaxMw.allowJsonp = function(req,res,next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, sessionid, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
    next();
};

module.exports = AjaxMw;