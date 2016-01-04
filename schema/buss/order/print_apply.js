/**
 * @des    :
 * @author : pigo.can
 * @date   : 16/1/4 下午6:13
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
module.exports = {
    'applicant_mobile' : {
        optional : false,
        isMobilePhone: {
            options: ['zh-CN']
        }
    },
    'director_mobile' : {
        optional : false,
        isMobilePhone: {
            options: ['zh-CN']
        }
    },
    'order_id' : {
        optional : false,
        notEmpty : true
    },
    'reason' : {
        optional : false,
        notEmpty : true
    }
};
