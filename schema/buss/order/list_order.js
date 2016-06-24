/**
 * @des    : the schema of the list order api
 * @author : pigo.can
 * @date   : 15/12/29 下午2:45
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
module.exports = {
    'begin_time': {
        optional : true,
        isDate : true,
        errorMessage : 'Invalid begin_time'
    },
    'end_time': {
        optional : true,
        isDate : true
    },
    'is_deal': {
        optional : true,
        isInt : true
    },
    'is_submit': {
        optional : true,
        isInt : true
    },
    'keywords': {
        optional : true
    },
    'src_id': {
        optional : true,
        isInt : true
    },
    'status': {
        optional : true
    },
    'city_id': {
        optional : true,
        isInt : true
    },
    'province_id': {
        optional : true,
        isInt : true
    },
    'page_no' : {
        isInt : true
    },
    'page_size' : {
        isInt : true
    },
    'owner_mobile': {
        optional : true,
        isMobilePhone: {
            options: ['zh-CN']
        }
    },
    'delivery_id' : {
        optional : true,
        isInt : true
    },
    'deliveryman_id' : {
        optional : true,
        isInt : true
    },
    'is_print' : {
        optional : true,
        isInt : true
    },
    'is_greeting_card' : {
        optional : true,
        isInt : true
    }
};
