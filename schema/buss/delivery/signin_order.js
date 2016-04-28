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
        optional : true
    },
    'payfor_reason' : {
        optional : true
    },
    'payfor_type' : {
        optional : true
    },
    'signin_time' : {
        notEmpty : true
    },
    'updated_time': {
        notEmpty: true,
        isDate: true
    },
    'deliveryman': {
        optional: true
    },
    'deliveryman.id':{
        isInt: true
    },
    'order': {
        optional: true
    }
};
