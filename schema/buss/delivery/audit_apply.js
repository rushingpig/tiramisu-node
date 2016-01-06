/**
 * @des    :
 * @author : pigo.can
 * @date   : 16/1/6 上午10:24
 * @email  : zhenglin.zhu@xfxb.net
 * @version: v0.0.1
 */
"use strict";
module.exports = {

    'audit_opinion' : {
        notEmpty : true
    },
    'status' : {
        notEmpty : true
    },
    'applicant_mobile' : {
        isMobilePhone: {
            options: ['zh-CN']
        }
    },
    'order_id' : {
        notEmpty : true,
        isLength : {
            options : [16]
        }
    },
};