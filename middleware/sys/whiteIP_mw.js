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
    const clientIP = toolUtils.getClientIP(req).split(':').pop();
    if(config.white_ips.indexOf(clientIP) === -1){
        res.status(503);
        return res.api(res_obj.NO_WHITE_LIST_IP, {ip: clientIP}, null);
    }
    next();
};

module.exports = WhiteIPMiddleware;
