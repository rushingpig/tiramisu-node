/**
 * @des    :
 * @author : pigo.can
 * @date   : 16/1/5 下午4:26
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
module.exports = {
    'begin_time' : {
        optional : true,
        isDate : true
    },
    'end_time' : {
        optional : true,
        isDate : true
    },
    'is_reprint' : {
        optional : true,
        isInt : true
    },
    'order_id' : {
        optional : true,
        notEmpty : true
    },
    'status' : {
        optional : true,
        notEmpty : true
    },
    'page_no' : {
        isInt : true
    },
    'page_size' : {
        isInt : true
    }
};