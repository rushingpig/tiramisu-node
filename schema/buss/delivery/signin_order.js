/**
 * @des    :
 * @author : pigo.can
 * @date   : 16/1/6 下午3:43
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
module.exports = {

    'late_minutes' : {
        isInt : true
    },
    'payfor_amount' : {
        optional : true,
        isInt : true
    },
    'payfor_reason' : {
        optional : true,
        notEmpty : true
    },
    'payfor_type' : {
        optional : true,
        notEmpty : true
    },
    'signin_time' : {
        notEmpty : true
    }
};
