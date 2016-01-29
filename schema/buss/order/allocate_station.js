/**
 * @des    :
 * @author : pigo.can
 * @date   : 16/1/29 下午4:15
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
module.exports = {
    delivery_id : {
        isInt : true
    },
    delivery_time : {
        notEmpty : true
    },
    delivery_type : {
        notEmpty : true
    },
    recipient_address : {
        notEmpty : true
    },
    regionalism_id : {
        isInt : true
    },
    updated_time : {
        notEmpty : true
    },
    prefix_address : {
        notEmpty : true
    }
};