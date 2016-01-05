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
        isMobilePhone: {
            options: ['zh-CN']
        }
    },
    'director_mobile' : {
        isMobilePhone: {
            options: ['zh-CN']
        }
    },
    'order_id' : {
        notEmpty : true
    },
    'reason' : {
        notEmpty : true
    }
};
