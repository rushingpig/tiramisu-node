/**
 * @des    :
 * @author : pigo.can
 * @date   : 16/2/1 下午4:38
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
var toolUtils = require('../../common/ToolUtils'),
    config = require('../../config'),
    TiramisuError = require('../../error/tiramisu_error'),
    res_obj = require('../../util/res_obj');


function WhiteIPMiddleware(){

}
/**
 * judge the client IP is in the white list
 * @param req
 * @param res
 * @param next
 * @returns {boolean}
 */
WhiteIPMiddleware.isInWhiteList = (req,res,next) => {
    let clientIP = toolUtils.getClientIP(req).split(':').pop();
    console.log(clientIP,'=========');
    if(config.white_ips.indexOf(clientIP.toString()) !== -1){
        next();
    }else{
        res.status(503);
        res.api(new TiramisuError(res_obj.NO_WHITE_LIST_IP),null);
    }
};

module.exports = WhiteIPMiddleware;
