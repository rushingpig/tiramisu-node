/**
 * @des    :
 * @author : pigo.can
 * @date   : 15/12/30 下午5:44
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
module.exports = {

    'recipient_id': {
        notEmpty: true
    },
    'delivery_type': {
        notEmpty: true
    },
    'owner_name': {
        notEmpty: true
    },
    'owner_mobile': {
        isMobilePhone: {
            options: ['zh-CN']
        }
    },
    'recipient_name': {
        notEmpty: true
    },
    'recipient_mobile': {
        isMobilePhone: {
            options: ['zh-CN']
        }
    },
    'regionalism_id': {
        notEmpty: true,
        isInt : true
    },
    'delivery_name' : {
        notEmpty : true
    },
    'recipient_address': {
        notEmpty: true
    },
    'delivery_id': {
        notEmpty: true,
        isInt : true
    },
    'src_id': {
        notEmpty: true,
        isInt : true
    },
    'pay_modes_id': {
        notEmpty: true,
        isInt : true
    },
    'pay_status': {
        notEmpty: true
    },
    'delivery_time': {
        notEmpty: true
    },
    'total_amount': {
        notEmpty: true
    },
    'updated_time' : {
        isDate : true
    }
};