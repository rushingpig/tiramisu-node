/**
 * @des    : the schema for validating add user
 * @author : pigo
 * @date   : 16/3/25
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";

module.exports = {
    city_ids: {
        isArray: {
            errorMessage : 'the role_ids must be an array...'
        }
    },
    // mobile: {
    //     isMobilePhone: {
    //         options: ['zh-CN']
    //     }
    // },
    name: {
        notEmpty : true
    },
    password: {
        optional : true,
        notEmpty : true
    },
    role_ids: {
        isArray : {
            errorMessage : 'the role_ids must be an array...'
        }
    },
    station_ids: {
        isArray : true
    },
    username: {
        notEmpty : true
    },
    is_headquarters : {
        isInt : true
    },
    is_national : {
        isInt : true
    }
};
